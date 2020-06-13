import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Logger, HAP } from 'homebridge';

import { Kit } from '../utils/kit';
import { Options } from '../options';
import { Utils } from '../utils/utils';

export class Audio {
  private log: Logger;
  private hap: HAP;
  private options: Options;

  private player: ChildProcessWithoutNullStreams | null = null;

  constructor(
    private readonly kit: Kit,
  ) {
    this.log = kit.log;
    this.hap = kit.hap;
    this.options = kit.options;
  }

  public play(type: string, state: number | string) {
    const mode = Utils.state2mode(this.hap, state);

    // Ignore 'Current Off' event
    if (mode === 'off') {
      if (type === 'target') {
        return;
      }
    }
  
    // Close previous player
    if (this.player !== null) {
      this.player.kill();
    }
  
    const filename = `${type}-${mode}.mp3`;
    const options = ['-loglevel', 'error', '-nodisp', `${__dirname}/sounds/${this.options.audioLanguage}/${filename}`];
  
    if (mode === 'triggered') {
      options.push('-loop');
      options.push('-1');
    } else if (mode === 'alert' && this.options.audioAlertLooped) {
      options.push('-loop');
      options.push('-1');
    }
   
    this.player = spawn('ffplay', options);
    
    this.player.stderr.on('data', (data) => {
      this.log.error(`Audio failed\n${data}`);
    });
  
    this.player.on('close', () => {
      this.player = null;
    });
  }
}