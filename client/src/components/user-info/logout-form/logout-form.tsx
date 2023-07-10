import classNames from 'classnames';
import styles from './logout-form.module.scss';
import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { ChangeEvent, FormEventHandler, useEffect, useState } from 'react';

export interface LogoutformProps {
    className?: string;
}

export const Logoutform = ({ className }: LogoutformProps) => {
    const tryLogout = async () => {
        const url =
            process.env.NODE_ENV === 'production'
                ? 'http://localhost:4001/logout'
                : 'http://localhost:4001/logout';
        axios
            .post(url, {}, { withCredentials: true })
            .then((res: AxiosResponse) => {
                if (res.status === 200) {
                    window.location.href = '/login';
                }
            })
            .catch((err: AxiosError) => {
                console.log('error logging out');
            });
    };

    return (
        <div className={classNames(styles.Logoutform, className)}>
            <form onSubmit={tryLogout}>
                <button type="submit">Logout</button>
            </form>
        </div>
    );
};
