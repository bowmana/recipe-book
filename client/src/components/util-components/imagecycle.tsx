import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './imagecycle.module.scss';

export interface ImageCycleProps {
    className?: string;
    imageUrls: string[];
}

export const ImageCycle = ({ className, imageUrls }: ImageCycleProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
        );
    };
    const rootClassName = classNames(styles.root, className, {
        [styles.socialTheme]: className === 'social-recipe-card',
    });
    return (
        <div className={rootClassName}>
            {imageUrls.length > 0 && (
                <div className={styles['image-container']}>
                    <img
                        className={styles['current-image']}
                        src={imageUrls[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1}`}
                    />

                    <div className={styles['button-container']}>
                        {imageUrls.length > 1 && (
                            <>
                                <button onClick={handlePrevImage}>Prev</button>
                                <span>{`${currentImageIndex + 1}/${imageUrls.length}`}</span>
                                <button onClick={handleNextImage}>Next</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* {imageUrls.map((imageUrl, index) => (
                <div key={index}>
                    <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '50px' }}
                        loading="lazy"
                    />
                    <button onClick={() => setCurrentImageIndex(index)}>Select</button>
                </div>
            ))} */}
        </div>
    );
};
