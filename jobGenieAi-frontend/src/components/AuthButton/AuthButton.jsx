import React from 'react';
import styles from './AuthButton.module.css';

const AuthButton = ({
    children,
    type = 'button',
    variant = 'primary',
    onClick,
    disabled = false,
    loading = false,
    fullWidth = true,
    icon
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`}
            aria-busy={loading}
        >
            {loading ? (
                <>
                    <span className={styles.spinner}></span>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default AuthButton;
