
declare module 'wav' {
    import { Transform } from 'stream';

    interface WriterOptions {
        channels?: number;
        sampleRate?: number;
        bitDepth?: number;
    }

    export class Writer extends Transform {
        constructor(options?: WriterOptions);
    }

    interface ReaderOptions {
        format?: string;
    }

    export class Reader extends Transform {
        constructor(options?: ReaderOptions);
        on(event: 'format', listener: (format: any) => void): this;
    }
}
