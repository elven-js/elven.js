import { ErrAsyncTimerAlreadyRunning, ErrAsyncTimerAborted } from './errors';

/*
 * AsyncTimer is an async-friendly abstraction that wraps JavaScript's setTimeout() and clearTimeout().
 */
export class AsyncTimer {
  private readonly name: string;
  private timeoutHandle: any = null;
  private rejectionFunc: any = null;
  private correlationTag: number;

  /**
   * Creates an AsyncTimer.
   */
  constructor(name: string) {
    this.name = name;
    this.correlationTag = 0;
  }

  /**
   * Starts the timer.
   * @param timeout The time (in milliseconds) to wait until resolving the promise.
   */
  public start(timeout: number): Promise<void> {
    if (this.timeoutHandle) {
      throw new ErrAsyncTimerAlreadyRunning();
    }

    this.correlationTag++;

    return new Promise<void>((resolve, reject) => {
      this.rejectionFunc = reject;

      const timeoutCallback = () => {
        this.rejectionFunc = null;
        this.stop();
        resolve();
      };

      this.timeoutHandle = setTimeout(timeoutCallback, timeout);
    });
  }

  /**
   * Aborts the timer: rejects the promise (if any) and stops the timer.
   */
  public abort() {
    if (this.rejectionFunc) {
      this.rejectionFunc(new ErrAsyncTimerAborted());
      this.rejectionFunc = null;
    }

    this.stop();
  }

  /**
   * Stops the timer.
   */
  public stop() {
    if (this.isStopped()) {
      return;
    }

    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  /**
   * Returns whether the timer is stopped.
   */
  public isStopped(): boolean {
    return this.timeoutHandle ? false : true;
  }
}
