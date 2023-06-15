import ReactModal from 'react-modal';
import ProgressBar from '@ramonak/react-progress-bar';
import styles from './loadingmodal.module.scss';

interface LoadingModalProps {
    isOpen: boolean;
    onRequestclose: () => void;
    uploadProgress: number;
    className?: string;
}

export const LoadingModal = ({
    isOpen,
    onRequestclose,
    uploadProgress,
    className,
}: LoadingModalProps) => {
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onRequestclose}
            className={styles['loading-modal']}
            overlayClassName="overlay"
        >
            <ProgressBar className={styles['progress-bar']} completed={uploadProgress} />
        </ReactModal>
    );
};
