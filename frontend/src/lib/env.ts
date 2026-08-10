/** Is this a local dev run (`astro dev`)?
 *  Uses MODE, not DEV — a globally-set NODE_ENV=production flips
 *  import.meta.env.DEV to false during `astro dev` (see sprint-19).
 *  MODE is set by the CLI ('development' / 'production') and is
 *  immune to NODE_ENV. */
export const isDev = import.meta.env.MODE === 'development';

/** Backend origin for media file URLs (client-side image src).
 *  Local dev: ports differ → full http://localhost:3000.
 *  Production: same origin via nginx → empty (relative URLs). */
export const API_ORIGIN: string = isDev ? 'http://localhost:3000' : '';
