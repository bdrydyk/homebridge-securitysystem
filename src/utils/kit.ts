import { Logger, HAP } from 'homebridge';

import { Options } from '../options';
import { Storage } from '../components/storage';

export class Kit {
  constructor(
    public readonly log: Logger,
    public readonly hap: HAP,
    public readonly options: Options,
    public readonly storage: Storage,
  ) { }
}