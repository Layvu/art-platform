import * as migration_20260318_032358_auto_20260318_082345 from './20260318_032358_auto_20260318_082345';
import * as migration_20260318_045539_auto_20260318_095525 from './20260318_045539_auto_20260318_095525';

export const migrations = [
    {
        up: migration_20260318_032358_auto_20260318_082345.up,
        down: migration_20260318_032358_auto_20260318_082345.down,
        name: '20260318_032358_auto_20260318_082345',
    },
    {
        up: migration_20260318_045539_auto_20260318_095525.up,
        down: migration_20260318_045539_auto_20260318_095525.down,
        name: '20260318_045539_auto_20260318_095525',
    },
];
