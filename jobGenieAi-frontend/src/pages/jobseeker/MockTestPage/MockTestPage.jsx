import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import mockTestService from '../../../services/mockTestService';
import interviewService from '../../../services/interviewService';
import styles from './MockTestPage.module.css';

const MockTestPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';
    const [activeTrack, setActiveTrack] = useState('');
    const [selectedTest, setSelectedTest] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [testsByTrack, setTestsByTrack] = useState({});
    const [loadingTracks, setLoadingTracks] = useState(true);
    const [loadingTests, setLoadingTests] = useState(false);
    const [startLoading, setStartLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTracks = async () => {
            try {
                setLoadingTracks(true);
                const data = await mockTestService.getTracks();
                const normalized = data || [];
                setTracks(normalized);
                if (normalized.length > 0) {
                    setActiveTrack(normalized[0].id);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load mock test tracks.');
            } finally {
                setLoadingTracks(false);
            }
        };
        loadTracks();
    }, []);

    useEffect(() => {
        if (!activeTrack) return;
        if (testsByTrack[activeTrack]) return;

        const loadTests = async () => {
            try {
                setLoadingTests(true);
                const tests = await mockTestService.getTestsByTrack(activeTrack);
                setTestsByTrack((prev) => ({ ...prev, [activeTrack]: tests || [] }));
            } catch (e) {
                console.error(e);
                setError('Failed to load tests for selected track.');
            } finally {
                setLoadingTests(false);
            }
        };
        loadTests();
    }, [activeTrack, testsByTrack]);

    const availableTests = testsByTrack[activeTrack] || [];
    const selectedTrack = useMemo(
        () => tracks.find((t) => t.id === activeTrack),
        [tracks, activeTrack]
    );

    const handleStartMockTest = async () => {
        if (!selectedTest) return;
        try {
            setStartLoading(true);
            setError('');
            const data = await interviewService.start(null, { mode: 'mock', testId: selectedTest.id });
            navigate(`/mock-interview/${data.applicationId}`);
        } catch (e) {
            console.error(e);
            setError('Could not start mock test. Please try again.');
        } finally {
            setStartLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.headerSection}>
                        <div>
                            <p className={styles.kicker}>Mock Tests</p>
                            <h1 className={styles.title}>Structured mock tests</h1>
                            <p className={styles.subtitle}>Create and run focused practice tests across the full stack.</p>
                        </div>
                    </section>

                    <section className={styles.layout}>
                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarHeader}>Tracks</div>
                            <ul className={styles.trackList}>
                                {loadingTracks && (
                                    <li className={styles.loadingText}>Loading tracks...</li>
                                )}
                                {tracks.map((track) => (
                                    <li key={track.id}>
                                        <button
                                            type="button"
                                            className={`${styles.trackButton} ${
                                                activeTrack === track.id ? styles.trackButtonActive : ''
                                            }`}
                                            onClick={() => {
                                                setActiveTrack(track.id);
                                                setSelectedTest(null);
                                            }}
                                        >
                                            <div className={styles.trackLabel}>{track.label}</div>
                                            <div className={styles.trackDescription}>
                                                {track.description}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <section className={styles.content}>
                            <header className={styles.contentHeader}>
                                <div>
                                    <h2 className={styles.contentTitle}>
                                        {selectedTrack?.label || 'Mock'} tests
                                    </h2>
                                    <p className={styles.contentSubtitle}>
                                        Select a test and start to get 5 random questions from that test&apos;s 200-question bank.
                                    </p>
                                </div>
                            </header>

                            {error && <div className={styles.errorBanner}>{error}</div>}

                            <div className={styles.testsGrid}>
                                {loadingTests && (
                                    <div className={styles.emptyState}>Loading tests...</div>
                                )}
                                {availableTests.map((test) => (
                                    <button
                                        key={test.id}
                                        type="button"
                                        className={`${styles.testCard} ${
                                            selectedTest?.id === test.id ? styles.testCardActive : ''
                                        }`}
                                        onClick={() => setSelectedTest(test)}
                                    >
                                        <div className={styles.testHeaderRow}>
                                            <h3 className={styles.testName}>{test.name}</h3>
                                        </div>
                                        <p className={styles.testFocus}>{test.focus}</p>
                                        <div className={styles.testMetaRow}>
                                            <span>{test.duration}</span>
                                            <span>{test.questionPoolSize || 200} questions</span>
                                        </div>
                                        {test.configurable && (
                                            <div className={styles.testConfigHint}>
                                                Configure frontend, backend and database stacks before
                                                starting.
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {availableTests.length === 0 && (
                                    <div className={styles.emptyState}>
                                        No tests configured for this track yet.
                                    </div>
                                )}
                            </div>

                            {selectedTest && (
                                <div className={styles.summaryPanel}>
                                    <div className={styles.summaryHeader}>
                                        <h3 className={styles.summaryTitle}>{selectedTest.name}</h3>
                                    </div>
                                    <p className={styles.summaryText}>
                                        This run will pick 5 random questions from the 200-question bank for this test.
                                    </p>
                                    {selectedTest.configurable && (
                                        <div className={styles.summaryConfig}>
                                            <div className={styles.summaryConfigRow}>
                                                <span>Frontend stack</span>
                                                <span className={styles.summaryConfigPlaceholder}>
                                                    Choose (e.g. React, Angular, Vue)
                                                </span>
                                            </div>
                                            <div className={styles.summaryConfigRow}>
                                                <span>Backend stack</span>
                                                <span className={styles.summaryConfigPlaceholder}>
                                                    Choose (e.g. Node, Spring Boot, Django)
                                                </span>
                                            </div>
                                            <div className={styles.summaryConfigRow}>
                                                <span>Database</span>
                                                <span className={styles.summaryConfigPlaceholder}>
                                                    Choose (e.g. PostgreSQL, MySQL, MongoDB)
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.summaryFooter}>
                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={handleStartMockTest}
                                            disabled={startLoading}
                                        >
                                            {startLoading ? 'Starting...' : 'Start mock test'}
                                        </button>
                                        <span className={styles.summaryHint}>
                                            Starts the same interview flow with 5 random questions.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>
                    </section>
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default MockTestPage;
