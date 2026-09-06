import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

export interface IGetByTestIdConfig {
  prefix?: string;
}

export const getByTestId = (
  template: DebugElement,
  testId: string,
  config?: IGetByTestIdConfig,
): DebugElement | null => {
  const { prefix = '' } = config ?? {};
  const fullTestId = prefix + testId;
  return template.query(By.css(`[data-testId="${fullTestId}"]`));
};