import { cn } from '@/app/lib/utils';
import { PackageOpenIcon } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function App() {
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });

  return (
    <div className="min-h-screen flex justify-center pt-20">
      <div className="w-full max-w-xl">
        <div
          {...getRootProps()}
          className={cn(
            'border h-60 w-full rounded-md border-dashed transition-colors',
            'flex items-center justify-center',
            'cursor-pointer',
            isDragActive && 'bg-accent/80',
          )}
        >
          <input {...getInputProps()} />

          <PackageOpenIcon className="size-10 stroke-1 mb-2" />

          <span>Solte os seus arquivos aqui</span>
          <span className="text-sm text-muted-foreground">Apenas arquivos PNG de até 1MB</span>
        </div>
      </div>
    </div>
  );
}
