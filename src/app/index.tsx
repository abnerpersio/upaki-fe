import { cn } from '@/app/lib/utils/styles';
import { Button } from '@/ui/components/button';
import { Progress } from '@/ui/components/progress';
import { Loader2Icon, PackageOpenIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { prepareUpload } from './services/prepare-upload';
import { uploadFile } from './services/upload-file';

type UploadItem = {
  status: 'pending' | 'success' | 'failed';
  file: File;
  progress: number;
};

export function App() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (uploadedFiles) => {
      setUploads((prevState) =>
        prevState
          .filter((prevFile) => {
            const isOverwritingFile = uploadedFiles.find((newFile) => newFile.name === prevFile.file.name);
            return !isOverwritingFile;
          })
          .concat(
            uploadedFiles.map((file) => ({
              file,
              status: 'pending',
              progress: 0,
            })),
          ),
      );
    },
  });

  const handleRemoveUpload = useCallback((index: number) => {
    setUploads((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      return newState;
    });
  }, []);

  const handleReset = () => setUploads([]);

  const handleUpload = async () => {
    if (!uploads.length) return;

    try {
      setIsLoading(true);
      const fileNames = uploads.map((item) => item.file.name);
      const urls = await prepareUpload(fileNames);

      const result = await Promise.allSettled(
        urls.map(async (url, index) => {
          const file = uploads[index].file;

          await uploadFile({
            url,
            file,
            onProgress: (percentage) => {
              setUploads((prevState) => {
                const newState = [...prevState];
                newState[index].progress = percentage;
                return newState;
              });
            },
          });
        }),
      );

      result.forEach((response, index) => {
        setUploads((prevState) => {
          const newState = [...prevState];
          newState[index].status = response.status === 'fulfilled' ? 'success' : 'failed';
          return newState;
        });
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center py-20 px-6">
      <div className="w-full max-w-xl">
        <div
          {...getRootProps()}
          className={cn(
            'border h-60 w-full rounded-md border-dashed transition-colors',
            'flex flex-col items-center justify-center',
            'cursor-pointer',
            isDragActive && 'bg-accent/80',
          )}
        >
          <input {...getInputProps()} />

          <PackageOpenIcon className="size-10 stroke-1 mb-2" />

          <span>Solte os seus arquivos aqui</span>
          <span className="text-sm text-muted-foreground">Apenas arquivos PNG de até 1MB</span>
        </div>

        {!!uploads.length && (
          <div className="mt-10 space-y-4">
            <h2 className="font-medium text-2xl tracking-tight">Arquivos selecionados</h2>

            <div className="space-y-2">
              {uploads.map(({ file, status, progress }, index) => (
                <div key={file.name} className="border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{file.name}</span>

                    <div className="flex gap-3 items-center justify-end">
                      <small
                        className={cn('text-sm', {
                          'text-destructive': status === 'failed',
                          'text-green-500': status === 'success',
                          'text-zinc-500 opacity-80': status === 'pending',
                        })}
                      >
                        {status === 'failed' && 'erro'}
                        {status === 'pending' && 'pendente'}
                        {status === 'success' && 'enviado'}
                      </small>

                      <Button
                        type="button"
                        onClick={() => handleRemoveUpload(index)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Progress className="h-2 mt-3" value={progress} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end items-center mt-4 gap-4">
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            onClick={handleReset}
            disabled={!uploads.length || isLoading}
          >
            <Trash2Icon />
            Resetar
          </Button>

          <Button
            type="button"
            onClick={handleUpload}
            className="w-full gap-2"
            disabled={!uploads.length || isLoading}
          >
            {isLoading && <Loader2Icon className="size-4 animate-spin" />}
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
