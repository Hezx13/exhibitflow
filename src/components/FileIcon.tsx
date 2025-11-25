import {
  PictureAsPdfRounded,
  ImageRounded,
  GridOnRounded,
  DescriptionRounded,
  InsertDriveFileRounded,
  CodeRounded,
  FolderZipRounded,
  AudioFileRounded,
  VideoFileRounded,
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

interface FileIconProps extends SvgIconProps {
  fileName: string;
}

export const FileIcon = ({ fileName, ...props }: FileIconProps) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'pdf':
      return <PictureAsPdfRounded color="error" {...props} />;
    
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'bmp':
      return <ImageRounded color="primary" {...props} />;
    
    case 'xlsx':
    case 'xls':
    case 'csv':
    case 'ods':
      return <GridOnRounded color="success" {...props} />;
    
    case 'txt':
    case 'doc':
    case 'docx':
    case 'rtf':
      return <DescriptionRounded color="info" {...props} />;
      
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FolderZipRounded color="warning" {...props} />;

    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'json':
    case 'html':
    case 'css':
    case 'py':
      return <CodeRounded color="action" {...props} />;
      
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <AudioFileRounded color="secondary" {...props} />;
      
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return <VideoFileRounded color="secondary" {...props} />;

    default:
      return <InsertDriveFileRounded color="action" {...props} />;
  }
};
