import { GDRIVE_FILENAME } from '../../config/constants';
import { getAccessToken } from './auth.service';

export class GDriveService {
  private getHeaders() {
    const token = getAccessToken();
    if (!token) throw new Error('Google OAuth access token missing');
    return { Authorization: `Bearer ${token}` };
  }

  // Finds existing health_planner_data.json file ID in appDataFolder
  async findStoreFile(): Promise<{ id: string; modifiedTime: string } | null> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${GDRIVE_FILENAME}' and trashed = false&fields=files(id,modifiedTime)`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) throw new Error(`Drive list error: ${res.statusText}`);
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  }

  // Downloads JSON payload from Drive
  async downloadStore(fileId: string): Promise<unknown> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Drive download error: ${res.statusText}`);
    return await res.json();
  }

  // Uploads/Updates JSON payload to appDataFolder
  async uploadStore(payload: object, existingFileId?: string): Promise<void> {
    const metadata = {
      name: GDRIVE_FILENAME,
      parents: existingFileId ? undefined : ['appDataFolder'],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(payload, null, 2) +
      closeDelimiter;

    const url = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

    const method = existingFileId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        ...this.getHeaders(),
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    });

    if (!res.ok) throw new Error(`Drive upload error: ${res.statusText}`);
  }
}

export const gDriveService = new GDriveService();
