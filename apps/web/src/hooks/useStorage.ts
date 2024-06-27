'use client'
import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask, UploadTaskSnapshot, deleteObject } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { storage } from '../firebase/config'

interface FileError {
    code: string;
    message: string;
}

export default function useStorage() {
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<FileError | null>(null);

    async function uploadFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileID = uuid();
            const storageRef = ref(storage, `${fileID}`);
            const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on('state_changed', (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            }, (error: FileError) => {
                setError(error);
                reject(error); // Reject the promise on error
            }, async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setProgress(0);
                    resolve(downloadURL); // Resolve the promise with the download URL
                } catch (error: any) {
                    setError(error);
                    reject(error); // Reject the promise if getting the URL fails
                }
            });
        });
    }
    
    async function removeImageFromStorage(fileID: string) {
        try {
            const fileRef = ref(storage, `${fileID}`);
            deleteObject(fileRef)
        } catch (error) {
            console.log(error);
        }
    }

    return { progress, error, uploadFile, removeImageFromStorage };
}
