import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import interviewService from '../../../services/interviewService';
import styles from './InterviewPage.module.css';

const MAX_DURATION = 600;

const InterviewPage = () => {
  const { applicationId, sessionId } = useParams();
  const isMockMode = !!sessionId;
  const interviewKey = isMockMode ? sessionId : applicationId;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.email?.split('@')[0] || 'User';

  const [stage, setStage] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timer, setTimer] = useState(MAX_DURATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const lastAudioKeyRef = useRef(null);

  const [liveTranscript, setLiveTranscript] = useState('');
  const recognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const timerRef = useRef(null);
  const firstQuestionRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis?.cancel();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (stage === 'interview') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  const handleAutoSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage('submitting');
    try {
      await interviewService.submit(interviewKey, { mode: isMockMode ? 'mock' : 'job' });
      setStage('done');
    } catch (e) {
      console.error(e);
      setError('Failed to auto-submit interview.');
    }
  }, [interviewKey, isMockMode]);

  const speakQuestion = useCallback(
    (audioBase64, questionText, key, force = false) => {
      const audioKey = key || 'default';
      if (!force && lastAudioKeyRef.current === audioKey && isSpeaking) {
        return;
      }
      lastAudioKeyRef.current = audioKey;
      setIsSpeaking(true);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          // ignore
        }
        audioRef.current = null;
      }
      if (audioBase64) {
        try {
          const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
            lastAudioKeyRef.current = null;
          };
          audio.play().catch(() => {
            setIsSpeaking(false);
            lastAudioKeyRef.current = null;
          });
          return;
        } catch (e) {
          console.warn('Audio creation error', e);
        }
      }
      setIsSpeaking(false);
    },
    [isSpeaking]
  );

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalText = '';
      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += t + ' ';
          } else {
            interim = t;
          }
        }
        const next = (finalText + interim).trimStart();
        liveTranscriptRef.current = next;
        setLiveTranscript(next);
      };
      recognition.onerror = (e) => {
        if (e.error === 'no-speech') return;
        console.warn('Speech recognition error:', e.error);
      };
      recognition.onend = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          try {
            recognition.start();
          } catch {
            //
          }
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init error:', e);
    }
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        //
      }
      recognitionRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    setError('');
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 2048;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          const data = new Uint8Array(analyser.fftSize);
          const tick = () => {
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / data.length);
            setAudioLevel(Math.min(100, Math.max(0, Math.round(rms * 220))));
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }
      } catch {
        //
      }

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      const audioBufferToWav = (buffer) => {
        const numCh = buffer.numberOfChannels;
        const sr = buffer.sampleRate;
        const bytesPerSample = 2;
        const blockAlign = numCh * bytesPerSample;
        const dataSize = buffer.length * blockAlign;
        const buf = new ArrayBuffer(44 + dataSize);
        const v = new DataView(buf);
        const write = (o, s) => {
          for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
        };
        write(0, 'RIFF');
        v.setUint32(4, 36 + dataSize, true);
        write(8, 'WAVE');
        write(12, 'fmt ');
        v.setUint32(16, 16, true);
        v.setUint16(20, 1, true);
        v.setUint16(22, numCh, true);
        v.setUint32(24, sr, true);
        v.setUint32(28, sr * blockAlign, true);
        v.setUint16(32, blockAlign, true);
        v.setUint16(34, 16, true);
        write(36, 'data');
        v.setUint32(40, dataSize, true);
        const ch = [];
        for (let i = 0; i < numCh; i++) ch.push(buffer.getChannelData(i));
        let off = 44;
        for (let i = 0; i < buffer.length; i++) {
          for (let c = 0; c < numCh; c++) {
            const s = Math.max(-1, Math.min(1, ch[c][i]));
            v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            off += 2;
          }
        }
        return new Blob([buf], { type: 'audio/wav' });
      };

      const submitWithDelay = (base64, format, explicitText = null) => {
        setTimeout(() => {
          const fallbackText =
            explicitText !== null ? explicitText : (liveTranscriptRef.current || '').trim();
          handleAnswerSubmit(base64 || '', fallbackText, format || 'webm');
          stopSpeechRecognition();
        }, 450);
      };

      mediaRecorder.onstop = () => {
        setTimeout(() => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          stream.getTracks().forEach((t) => t.stop());
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
          setAudioLevel(0);
          if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
            analyserRef.current = null;
          }
          if (!blob || blob.size === 0) {
            const fallbackText = (liveTranscriptRef.current || '').trim();
            submitWithDelay('', null, fallbackText || 'No answer provided');
            return;
          }
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          blob
            .arrayBuffer()
            .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
            .then((decoded) => {
              const wavBlob = audioBufferToWav(decoded);
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result?.split(',')[1];
                if (base64 && base64.length > 100) {
                  submitWithDelay(base64, 'wav');
                } else {
                  throw new Error('WAV base64 too short');
                }
              };
              reader.onerror = () => {
                throw new Error('FileReader failed');
              };
              reader.readAsDataURL(wavBlob);
            })
            .catch(() => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result?.split(',')[1];
                if (base64 && base64.length > 100) {
                  submitWithDelay(base64, 'webm');
                } else {
                  const fallbackText = (liveTranscriptRef.current || '').trim();
                  submitWithDelay('', null, fallbackText || 'No answer provided');
                }
              };
              reader.onerror = () => {
                const fallbackText = (liveTranscriptRef.current || '').trim();
                submitWithDelay('', null, fallbackText || 'No answer provided');
              };
              reader.readAsDataURL(blob);
            });
        }, 100);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      recordTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      startSpeechRecognition();
    } catch (err) {
      console.error('Mic error:', err);
      setError('Microphone access denied. Allow mic permissions in browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        //
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  const startInterview = async () => {
    setLoading(true);
    setError('');
    try {
      if (isMockMode) {
        // Mock session is already created on MockTestPage — skip re-calling /start.
        // totalQuestions will be populated when the first question is fetched.
        setStage('interview');
        setLoading(false);
        return;
      }
      const data = await interviewService.start(interviewKey, { mode: 'job' });
      setTotalQuestions(data.totalQuestions || 0);
      setStage('interview');
    } catch (e) {
      console.error(e);
      setError('Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await interviewService.getQuestion(interviewKey, { mode: isMockMode ? 'mock' : 'job' });
      setCurrentQuestion(data);
      setTotalQuestions(data.totalQuestions || totalQuestions);
      setTimeout(
        () => speakQuestion(data.audioUrl, data.questionText, `q-${data.questionNumber}`),
        500
      );
    } catch (e) {
      console.error(e);
      const msg = e?.message || '';
      const lower = msg.toLowerCase();
      if (lower.includes('all questions')) {
        await handleSubmitInterview();
      } else {
        setError(msg || 'Failed to fetch question.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stage === 'interview' && !currentQuestion && !firstQuestionRequestedRef.current) {
      firstQuestionRequestedRef.current = true;
      fetchNextQuestion();
    }
  }, [stage, currentQuestion]);

  const handleAnswerSubmit = async (base64Audio, fallbackText = '', audioFormat = 'webm') => {
    if (!currentQuestion) return;
    setLoading(true);
    setError('');
    setLiveTranscript('');
    try {
      await interviewService.submitAnswer(interviewKey, {
        questionNumber: currentQuestion.questionNumber,
        audio: base64Audio || '',
        textAnswer: fallbackText || '',
        audioFormat: audioFormat || 'webm',
      }, { mode: isMockMode ? 'mock' : 'job' });
      setAnsweredCount((prev) => prev + 1);
      if (currentQuestion.isLastQuestion) {
        handleSubmitInterview();
      } else {
        setCurrentQuestion(null);
        firstQuestionRequestedRef.current = false;
      }
    } catch (e) {
      console.error(e);
      setError('Failed to submit answer.');
      setLoading(false);
    }
  };

  const handleSubmitInterview = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage('submitting');
    try {
      await interviewService.submit(interviewKey, { mode: isMockMode ? 'mock' : 'job' });
      setStage('done');
    } catch (e) {
      console.error(e);
      setError('Failed to submit interview.');
    }
  };

  const skipQuestion = () => handleAnswerSubmit('', 'No answer provided');

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.page}>
      <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />
      <main className={styles.main}>
        <div className={styles.container}>
          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️</span>
              <span>{error}</span>
              <button type="button" onClick={() => setError('')}>
                ✕
              </button>
            </div>
          )}

          {stage === 'start' && (
            <div className={styles.cardCentered}>
              <h1 className={styles.title}>AI Voice Interview</h1>
              <p className={styles.subtitle}>
                AI will speak each question. Record your voice answers.
              </p>
              <ul className={styles.bulletList}>
                <li>Use Chrome or Edge and allow camera and microphone access.</li>
                <li>Speak clearly for at least 3 seconds for each answer.</li>
                <li>You will have a limited time to complete all questions.</li>
              </ul>
              <button
                type="button"
                onClick={startInterview}
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? 'Preparing interview...' : 'Start Interview'}
              </button>
            </div>
          )}

          {stage === 'interview' && (
            <div className={styles.interviewLayout}>
              <div className={styles.interviewHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.timer}>
                    <span className={timer < 60 ? styles.timerDanger : ''}>{formatTime(timer)}</span>
                  </div>
                  <div>
                    <div className={styles.headerTitle}>AI Voice Interview</div>
                    <div className={styles.headerSub}>Answer out loud • Your responses are analyzed in real time</div>
                  </div>
                </div>
                <div className={styles.counter}>
                  <div>
                    Question {currentQuestion?.questionNumber || '-'} of {totalQuestions || '-'}
                  </div>
                  <div className={styles.progressBarOuter}>
                    <div
                      className={styles.progressBarInner}
                      style={{
                        width:
                          totalQuestions > 0 && currentQuestion?.questionNumber
                            ? `${(currentQuestion.questionNumber / totalQuestions) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>

                <div className={styles.columns}>
                <div className={styles.contentColumn}>
                  <div className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionBadge}>
                        Q{currentQuestion?.questionNumber || '-'}
                      </span>
                      {currentQuestion && !isSpeaking && (
                        <button
                          type="button"
                          className={styles.replayButton}
                          onClick={() =>
                            speakQuestion(
                              currentQuestion.audioUrl,
                              currentQuestion.questionText,
                              `q-${currentQuestion.questionNumber}`,
                              true
                            )
                          }
                        >
                          Replay Question
                        </button>
                      )}
                    </div>
                    <p className={styles.questionText}>
                      {loading && !currentQuestion
                        ? 'Loading question...'
                        : currentQuestion?.questionText}
                    </p>
                  </div>

                  <div className={styles.answerCard}>
                    <p className={styles.answerHint}>
                      {isRecording
                        ? 'Recording your answer...'
                        : loading
                        ? 'Processing answer...'
                        : isSpeaking
                        ? 'Listen to the question, then record your answer.'
                        : 'Press the button below to record your answer.'}
                    </p>
                    <div className={styles.micRow}>
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={loading || isSpeaking}
                        className={`${styles.micButton} ${
                          isRecording ? styles.micButtonRecording : ''
                        }`}
                      >
                        {isRecording ? 'Stop' : 'Record'}
                      </button>
                      {isRecording && (
                        <div className={styles.levelRow}>
                          <span className={styles.levelTime}>{formatTime(recordingTime)}</span>
                          <div className={styles.levelBarOuter}>
                            <div
                              className={styles.levelBarInner}
                              style={{ width: `${audioLevel}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {liveTranscript && (
                      <div className={styles.transcriptBox}>
                        <div className={styles.transcriptLabel}>Live transcript:</div>
                        <div className={styles.transcriptText}>{liveTranscript}</div>
                      </div>
                    )}
                    <div className={styles.footerRow}>
                      <button
                        type="button"
                        onClick={skipQuestion}
                        disabled={loading || isRecording || isSpeaking}
                        className={styles.skipButton}
                      >
                        Skip this question →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage === 'submitting' && (
            <div className={styles.cardCentered}>
              <div className={styles.spinner} />
              <h2 className={styles.title}>Evaluating Your Interview</h2>
              <p className={styles.subtitle}>AI is analyzing your answers...</p>
            </div>
          )}

          {stage === 'done' && (
            <div className={styles.cardCentered}>
              <h2 className={styles.title}>Interview Complete</h2>
              <p className={styles.subtitle}>
                Your answers have been submitted. View your AI-generated results.
              </p>
              <button
                type="button"
                onClick={() => navigate(isMockMode ? `/mock-interview-result/${interviewKey}` : `/interview-result/${interviewKey}`)}
                className={styles.primaryButton}
              >
                View Results →
              </button>
            </div>
          )}
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
};

export default InterviewPage;

