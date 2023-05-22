import classNames from 'classnames';
import styles from './register-form.module.scss';
import React, { ChangeEvent, FormEventHandler, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';

export interface RegisterformProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/configuration-for-registerforms-and-templates
 */
export const Registerform = ({ className }: RegisterformProps) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleUserName = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleRepeatPassword = (e: ChangeEvent<HTMLInputElement>) => {
        setRepeatPassword(e.target.value);
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (password !== repeatPassword) {
            alert('passwords do not match');
            return;
        }
        if (password.length < 6) {
            alert('password must be at least 6 characters long');
            return;
        }
        if (username.length < 3) {
            alert('username must be at least 3 characters long');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            alert('email must be valid');
            return;
        }

        if (!email || !password || !repeatPassword) {
            alert('please fill all the fields');
            return;
        }

        const data = {
            email,
            password,
            repeatPassword,
        };

        const url = 'http://localhost:4001/register';
        const response = await axios
            .post(url, data, { withCredentials: true })
            .then((res: AxiosResponse) => {
                console.log(res);
                if (res.status === 201) {
                    console.log('user created');
                    window.location.href = '/home';
                }
            })
            .catch((err: AxiosError) => {
                if (err.response?.status === 401) {
                    alert('user already exists');
                } else if (err.response?.status === 500) {
                    alert('something went wrong on our side');
                }
                console.log(err);
                return err;
            });

        console.log(response);
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>username:</label>
                    <br />
                    <input
                        type="text"
                        className={styles['username-input']}
                        onChange={handleUserName}
                    />
                    <br />

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
                    <label>repeat password:</label>
                    <br />
                    <input
                        type="text"
                        className={styles['repeat-pass-input']}
                        onChange={handleRepeatPassword}
                    />
                    <br />
                    <input type="submit" value="Submit" className={styles['register-submit']} />
                </form>
            </div>
        </div>
    );
};
