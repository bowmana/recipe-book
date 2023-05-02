import classNames from 'classnames';
import styles from './login-form.module.scss';
import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { ChangeEvent, FormEventHandler, useEffect, useState } from 'react';

export interface LoginformProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-loginforms-and-templates
 */
export const Loginform = ({ className }: LoginformProps) => {
    useEffect(() => {
        const checkLogin = async () => {
            const url = 'http://localhost:4001/auth';
            await axios
                .post(url, {}, { withCredentials: true })
                .then((res: AxiosResponse) => {
                    if (res.status === 200) {
                        alert('you are already logged in');
                        window.location.href = '/';
                    }
                })
                .catch((err: AxiosError) => {
                    console.log(err);
                    return;
                });
        };
        checkLogin();
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('please fill all the fields');
            return;
        }

        const data: { email: string; password: string } = {
            email,
            password,
        };

        const url = 'http://localhost:4001/login';
        await axios
            .post(url, data, { withCredentials: true })
            .then((res: AxiosResponse) => {
                if (res.status === 200) {
                    alert('you are logged in');
                    window.location.href = '/';
                }
                if (res.status === 204) {
                    console.log('no content', res);
                }
            })
            .catch((err: AxiosError) => {
                console.log(err);
                if (err.response?.status === 401) {
                    alert('wrong email or password');
                    window.location.reload();
                } else if (err.response?.status === 500) {
                    alert('server error');
                    window.location.reload();
                } else if (err.response?.status === 400) {
                    alert('user with this email does not exist');
                    window.location.reload();
                }
            });
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>email:</label>
                    <br />
                    <input type="text" className={styles['email-input']} onChange={handleEmail} />
                    <br />
                    <label>password:</label>
                    <br />
                    <input
                        type="text"
                        className={styles['password-input']}
                        onChange={handlePassword}
                    />
                    <br />

                    <input type="submit" value="Submit" className={styles['login-submit']} />
                </form>
            </div>
        </div>
    );
};
