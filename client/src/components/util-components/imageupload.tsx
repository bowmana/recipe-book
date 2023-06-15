import React, { useEffect, ChangeEvent, useState } from 'react';

import classNames from 'classnames';
import styles from './imageupload.module.scss';

export interface ImageUploadProps {
    className?: string;
    maxImages?: number;
    addImages?: (images: File[]) => void;
}

export const ImageUpload = ({ className, maxImages = 5, addImages }: ImageUploadProps) => {
    const [images, setImages] = useState<File[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

    useEffect(() => {
        if (addImages) {
            addImages(images);
        }
    }, [images]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(event.target.files || []);
        const validImages = uploadedFiles.filter((file) => file.type.includes('image/'));
        const existingImages = images.map((image) => ({
            size: image.size,
            lastModified: image.lastModified,
        }));

        const updatedImages = validImages.filter((newImage) => {
            const isDuplicate = existingImages.some(
                (existingImage) =>
                    existingImage.size === newImage.size &&
                    existingImage.lastModified === newImage.lastModified
            );

            return !isDuplicate;
        });

        const newImages = [...images, ...updatedImages].slice(0, maxImages);

        updateImages(newImages);

        console.log('images', images);
    };

    const updateImages = (newImages: File[]) => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            const dataTransfer = new DataTransfer();
            newImages.forEach((file) => {
                dataTransfer.items.add(file);
            });
            fileInput.files = dataTransfer.files;
        }

        setImages(newImages);
        setCurrentImageIndex(newImages.length - 1); // Set currentImageIndex to the last uploaded image
    };

    const handleImageDelete = () => {
        if (currentImageIndex !== null) {
            const updatedImages = [...images];
            const deletedImage = updatedImages.splice(currentImageIndex, 1)[0];
            const deletedImageURL = URL.createObjectURL(deletedImage);
            URL.revokeObjectURL(deletedImageURL);

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                const files = Array.from(fileInput.files || []);
                const deletedFileIndex = files.findIndex(
                    (file) =>
                        file.size === deletedImage.size &&
                        file.lastModified === deletedImage.lastModified
                );
                if (deletedFileIndex !== -1) {
                    files.splice(deletedFileIndex, 1);
                    const dataTransfer = new DataTransfer();
                    files.forEach((file) => {
                        dataTransfer.items.add(file);
                    });
                    fileInput.files = dataTransfer.files;
                }
            }

            setImages(updatedImages);
            setCurrentImageIndex((prevIndex) => {
                if (prevIndex === null || prevIndex >= updatedImages.length) {
                    return updatedImages.length > 0 ? 0 : null;
                }
                return prevIndex;
            });
        }
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === null || prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === null || prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleClearImages = () => {
        // Revoke URLs and delete files associated with all images
        images.forEach((image) => {
            const imageURL = URL.createObjectURL(image);
            URL.revokeObjectURL(imageURL); // Revoke the URL created for the image
        });

        // If you have access to the file input element, you can remove all files from the input's file list
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Clear the value to remove all selected files
            fileInput.files = null; // Reset the file list
        }

        // Clear the images state
        setImages([]);
        setCurrentImageIndex(null);
    };
    return (
        <div>
            <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageUpload}
                multiple
            />
            <div>
                {images.length > 0 && currentImageIndex !== null && (
                    <img
                        src={URL.createObjectURL(images[currentImageIndex])}
                        alt={`Image ${currentImageIndex + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                )}
                <div>
                    {currentImageIndex !== null && (
                        <>
                            <button onClick={handlePrevImage}>Prev</button>
                            <span>{`${currentImageIndex + 1}/${images.length}`}</span>
                            <button onClick={handleNextImage}>Next</button>
                            <button onClick={handleImageDelete}>Delete</button>
                        </>
                    )}
                </div>
                <button onClick={handleClearImages}>Clear All</button>
            </div>
            {images.map((image, index) => (
                <div key={index}>
                    <img
                        src={URL.createObjectURL(image)}
                        alt={`Image ${index + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '50px' }}
                    />
                    <button onClick={() => setCurrentImageIndex(index)}>Select</button>
                </div>
            ))}
        </div>
    );
};
