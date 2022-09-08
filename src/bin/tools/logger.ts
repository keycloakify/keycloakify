type LoggerOpts = {
    force?: boolean;
};

type Logger = {
    log: (message: string, opts?: LoggerOpts) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
};

export const getLogger = ({ isSilent }: { isSilent?: boolean } = {}): Logger => {
    return {
        log: (message, { force } = {}) => {
            if (isSilent && !force) {
                return;
            }

            console.log(message);
        },
        warn: message => {
            console.warn(message);
        },
        error: message => {
            console.error(message);
        }
    };
};
