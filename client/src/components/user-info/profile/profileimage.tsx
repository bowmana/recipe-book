import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './profileimage.module.scss';
import axios from 'axios';

export interface ImageUploadProps {
    className?: string;
    initialImage?: string;
    user_id: number;
}

export const ProfileImageUpload = ({ className, initialImage, user_id }: ImageUploadProps) => {
    const [image, setImage] = useState<File | null>(null);
    const [retrievedImage, setRetrievedImage] = useState<string>('');
    const [imageSaved, setImageSaved] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0] || null;
        if (uploadedFile && uploadedFile.type.includes('image/')) {
            setImage(uploadedFile);
            setImageSaved(false); // Reset imageSaved when a new image is uploaded
        }
    };

    const handleImageDeleteOrEdit = () => {
        if (imageSaved) {
            // Handle "Edit" functionality
            // You can implement your logic to trigger image editing here
            setIsEditing(true);
        } else {
            // Handle "Delete" functionality
            setImage(null);
        }
    };

    const handleImageSave = async () => {
        if (image) {
            const formData = new FormData();
            formData.append('profile_image', image);
            const config = {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            };
            try {
                const response = await axios.post(
                    `http://localhost:4001/user/${user_id}/profile-image`,
                    formData,
                    config
                );
                console.log(response, 'response');
                if (response) {
                    setRetrievedImage(response.data);
                    console.log(response.data, 'response.data');
                }
            } catch (error) {
                console.log(error);
            }

            console.log('Image saved to server:', image.name);
            setImageSaved(true);
            setIsEditing(false);
        }
    };
    const handleExitEdit = () => {
        setIsEditing(false);
        setImage(null); // Reset the image to remove any uploaded file
    };
    useEffect(() => {
        const fetchImageAndSendToEventBus = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:4001/user/${user_id}/profile-image`
                );
                if (response.data) {
                    setRetrievedImage(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchImageAndSendToEventBus();
    }, [user_id]);

    useEffect(() => {
        const sendProfileImageUploadEvent = async () => {
            try {
                const res = await axios.post(`http://localhost:4005/events`, {
                    type: 'ProfileImageUpload',
                    data: {
                        user_id: user_id,
                        profile_image: retrievedImage,
                    },
                });
                console.log(res, 'res');
            } catch (error) {
                console.log(error);
            }
        };

        if (imageSaved && retrievedImage) {
            sendProfileImageUploadEvent();
        }
    }, [imageSaved, retrievedImage, user_id]);

    return (
        <div className={classNames(styles['image-upload'], className)}>
            <h2>Profile Picture</h2>
            <h2>{user_id}</h2>
            {retrievedImage ? (
                <div className={styles['image-preview-container']}>
                    <img
                        className={styles['current-image']}
                        src={retrievedImage}
                        alt="Profile Picture"
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                    <div className={styles['image-preview-controls']}>
                        {isEditing ? (
                            <button onClick={handleExitEdit}>Cancel</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)}>Edit</button>
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles['initial-image']}>
                    {initialImage && (
                        <>
                            <img
                                src={initialImage}
                                alt="Initial Image"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                            />
                            <div className={styles['image-preview-controls']}>
                                {isEditing ? (
                                    <button onClick={handleExitEdit}>Cancel</button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)}>Edit</button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
            {isEditing && (
                <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />
            )}
            {image && !imageSaved && (
                <div className={styles['image-preview-container']}>
                    <img
                        className={styles['current-image']}
                        src={URL.createObjectURL(image)}
                        alt="Profile Picture"
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                    <div className={styles['image-preview-controls']}>
                        <button onClick={handleImageDeleteOrEdit}>Delete</button>
                        <button onClick={handleImageSave}>Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};
