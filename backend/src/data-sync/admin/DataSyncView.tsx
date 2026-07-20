// Custom Payload admin view at /admin/data-sync — the "Data Sync & Backup" page.
// Payload renders custom views within its admin shell, so this just provides content;
// interactivity lives in the client component.

import { DataSyncClient } from './DataSyncClient'

export const DataSyncView = () => <DataSyncClient />

export default DataSyncView
