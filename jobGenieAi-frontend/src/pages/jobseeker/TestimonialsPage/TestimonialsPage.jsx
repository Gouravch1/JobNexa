import React from 'react';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import styles from './TestimonialsPage.module.css';

const TestimonialsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const testimonials = [
        {
            id: 1,
            name: 'Rahul Kumar',
            position: 'Software Engineer at Google',
            image: null,
            rating: 5,
            text: 'Jobnexa helped me land my dream job at Google! The AI interview practice was incredibly helpful in preparing me for the real thing.',
            company: 'Google'
        },
        {
            id: 2,
            name: 'Priya Sharma',
            position: 'Product Manager at Microsoft',
            image: null,
            rating: 5,
            text: 'The platform made job hunting so much easier. I found the perfect role that matched my skills and interests. Highly recommend!',
            company: 'Microsoft'
        },
        {
            id: 3,
            name: 'Amit Patel',
            position: 'Full Stack Developer at Amazon',
            image: null,
            rating: 5,
            text: 'Amazing experience! The mock interviews gave me the confidence I needed. Got placed at Amazon within 2 months of using this platform.',
            company: 'Amazon'
        },
        {
            id: 4,
            name: 'Sneha Reddy',
            position: 'UI/UX Designer at Adobe',
            image: null,
            rating: 5,
            text: 'Jobnexa is a game-changer! The AI-powered job recommendations were spot-on, and I found my ideal role at Adobe.',
            company: 'Adobe'
        },
        {
            id: 5,
            name: 'Vikram Singh',
            position: 'Data Scientist at Meta',
            image: null,
            rating: 5,
            text: 'The best job portal I have used. The interview preparation tools and personalized job suggestions made all the difference.',
            company: 'Meta'
        },
        {
            id: 6,
            name: 'Ananya Gupta',
            position: 'Frontend Developer at Netflix',
            image: null,
            rating: 5,
            text: 'I was skeptical at first, but Jobnexa exceeded my expectations. Landed my dream job at Netflix! Thank you!',
            company: 'Netflix'
        }
    ];

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Success Stories</h1>
                        <p className={styles.subtitle}>Hear from professionals who found their dream jobs with Jobnexa</p>
                    </div>

                    <div className={styles.testimonialsGrid}>
                        {testimonials.map(testimonial => (
                            <div key={testimonial.id} className={styles.testimonialCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div className={styles.userInfo}>
                                        <h3 className={styles.userName}>{testimonial.name}</h3>
                                        <p className={styles.userPosition}>{testimonial.position}</p>
                                    </div>
                                </div>

                                <div className={styles.rating}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className={styles.star}>⭐</span>
                                    ))}
                                </div>

                                <p className={styles.testimonialText}>
                                    "{testimonial.text}"
                                </p>

                                <div className={styles.companyBadge}>
                                    {testimonial.company}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default TestimonialsPage;
