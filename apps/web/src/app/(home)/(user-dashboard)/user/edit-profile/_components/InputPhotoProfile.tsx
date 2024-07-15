import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiCameraFill } from "react-icons/pi";
import { toast } from "sonner";

export function InputPhotoProfile({ setFile }: { setFile: React.Dispatch<React.SetStateAction<File | null>> }) {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                const fileType = selectedFile.type;
                const fileSize = selectedFile.size;
                const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    
                if (!allowedTypes.includes(fileType)) {
                    setFile(null);
                    toast.error("Only JPG, JPEG, PNG, and GIF files are allowed.")
                    return;
                }
    
                if (fileSize > 1048576) {
                    setFile(null);
                    toast.error("File size should be less than 1 MB")
                    return;
                }
    
                setFile(selectedFile);
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center w-full h-full">
            <Label htmlFor="change-photo-input" className="flex flex-col justify-center items-center cursor-pointer w-full h-full">
                <PiCameraFill className="fill-white" size={'3rem'} />
                <span className="text-white">change photo</span>
            </Label>
            <Input
                id="change-photo-input"
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
