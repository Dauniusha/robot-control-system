import { inspect } from 'node:util';
import { type Logform } from 'winston';
import { capitalizeFirst } from '../../utils/strings';

const colorizers = {
  green: (text: string): string => `\u001B[32m${text}\u001B[39m`,
  yellow: (text: string): string => `\u001B[33m${text}\u001B[39m`,
  red: (text: string): string => `\u001B[31m${text}\u001B[39m`,
  magentaBright: (text: string): string => `\u001B[95m${text}\u001B[39m`,
  cyanBright: (text: string): string => `\u001B[96m${text}\u001B[39m`,
};

const customColorSchema: Record<string, (text: string) => string> = {
  info: colorizers.green,
  error: colorizers.red,
  warn: colorizers.yellow,
  debug: colorizers.magentaBright,
  verbose: colorizers.cyanBright,
};

export function formatWinstonLog(
  log: Logform.TransformableInfo,
  depth: number | undefined,
): string {
  const baseColorizer =
    customColorSchema[log.level] ?? ((text: string): string => text);
  const yellowColorizer = colorizers.yellow;

  delete (log.value as { message?: string }).message;
  const payload = log.value as Record<string, unknown>;

  const payloadlessMessage =
    `${baseColorizer('[' + capitalizeFirst(log.level) + ']')}\t` +
    `${log.timestamp as string}\t` +
    `${yellowColorizer('[' + (log.context as string) + ']')} ` +
    `${baseColorizer(log.message as string)} ` +
    yellowColorizer(log.ms as string);

  const stackMessage = log.stack ? `\n${log.stack as string}` : '';
  return Object.keys(payload).length > 0
    ? payloadlessMessage +
        ` - ${inspect(payload, {
          compact: false,
          colors: true,
          depth,
        })}` +
        stackMessage
    : payloadlessMessage + stackMessage;
}
