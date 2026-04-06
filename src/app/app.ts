import { Component, computed, HostListener, signal } from '@angular/core';

type Operator = '+' | '-' | '*' | '/';

const template = `
  <main class="shell">
    <div class="background-art" aria-hidden="true">
      <div class="orb orb-one"></div>
      <div class="orb orb-two"></div>
      <div class="orb orb-three"></div>
      <div class="mesh"></div>
      <div class="grid"></div>
    </div>

    <section class="hero">
      <p class="eyebrow">Everyday Calculator</p>
      <h1>Fast math with a polished, keyboard-friendly layout.</h1>
      <p class="intro">
        Clean input, live results, quick corrections, and a bright interface that feels easy the
        second you open it.
      </p>

      <div class="feature-row" aria-label="Calculator features">
        <span>Live preview</span>
        <span>Keyboard support</span>
        <span>Clear + backspace</span>
        <span>+, -, x, /</span>
      </div>
    </section>

    <section class="calculator" aria-label="Calculator">
      <div class="display-panel">
        <p class="history">{{ history() }}</p>
        <p class="expression" aria-label="Current expression">{{ displayValue() }}</p>
        @if (previewValue()) {
          <div class="result-line" aria-live="polite">
            <p class="preview">{{ previewValue() }}</p>
          </div>
        }
      </div>

      <div class="keypad" role="group" aria-label="Calculator buttons">
        @for (row of buttons; track $index) {
          <div class="key-row">
            @for (button of row; track button.label) {
              <button
                type="button"
                class="key {{ button.variant }}"
                (click)="handleButtonPress(button)"
                [attr.aria-label]="button.label"
              >
                {{ button.label }}
              </button>
            }
          </div>
        }
      </div>
    </section>
  </main>
`;

const styles = `
  :host {
    --bg-top: #fff4db;
    --bg-bottom: #f3d3be;
    --panel: rgba(28, 28, 40, 0.9);
    --panel-glow: rgba(255, 255, 255, 0.14);
    --text-main: #fff8ef;
    --text-soft: rgba(255, 248, 239, 0.72);
    --number-key: rgba(255, 255, 255, 0.1);
    --utility-key: rgba(255, 237, 197, 0.18);
    --operator-key: linear-gradient(135deg, #ff9966, #ff5e62);
    --accent-key: linear-gradient(135deg, #7bd389, #3fa34d);
    --shadow-strong: 0 28px 60px rgba(50, 24, 9, 0.22);
    --shadow-soft: 0 14px 30px rgba(12, 8, 6, 0.18);
    display: block;
    min-height: 100vh;
    color: var(--text-main);
    font-family: "Outfit", "Segoe UI", sans-serif;
  }

  :host * {
    box-sizing: border-box;
  }

  .shell {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(280px, 430px) minmax(300px, 420px);
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.92), transparent 30%),
      radial-gradient(circle at bottom right, rgba(255, 153, 102, 0.25), transparent 28%),
      linear-gradient(145deg, var(--bg-top), var(--bg-bottom));
  }

  .background-art {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .orb,
  .mesh,
  .grid {
    position: absolute;
  }

  .orb {
    border-radius: 50%;
    filter: blur(8px);
    opacity: 0.9;
  }

  .orb-one {
    top: -8rem;
    left: -6rem;
    width: 24rem;
    height: 24rem;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 210, 158, 0.1) 70%);
  }

  .orb-two {
    right: -8rem;
    top: 12%;
    width: 28rem;
    height: 28rem;
    background: radial-gradient(circle, rgba(255, 131, 94, 0.45) 0%, rgba(255, 131, 94, 0.04) 72%);
  }

  .orb-three {
    left: 38%;
    bottom: -10rem;
    width: 22rem;
    height: 22rem;
    background: radial-gradient(circle, rgba(255, 232, 165, 0.42) 0%, rgba(255, 232, 165, 0.02) 75%);
  }

  .mesh {
    inset: 10% 14% auto auto;
    width: 34rem;
    height: 34rem;
    border-radius: 42% 58% 63% 37% / 47% 40% 60% 53%;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.75), transparent 28%),
      radial-gradient(circle at 70% 45%, rgba(255, 164, 114, 0.42), transparent 32%),
      radial-gradient(circle at 55% 72%, rgba(255, 214, 162, 0.56), transparent 24%);
    filter: blur(18px);
    opacity: 0.72;
    transform: rotate(-16deg);
  }

  .grid {
    inset: 0;
    background-image:
      linear-gradient(rgba(98, 63, 46, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(98, 63, 46, 0.08) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
    opacity: 0.55;
  }

  .hero {
    position: relative;
    z-index: 1;
    color: #2f1a15;
    padding: 1rem 0.5rem;
  }

  .eyebrow {
    display: inline-flex;
    margin: 0 0 1rem;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.65);
    box-shadow: var(--shadow-soft);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .hero h1 {
    margin: 0;
    font-size: clamp(2.5rem, 5vw, 4.8rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .intro {
    margin: 1.2rem 0 0;
    max-width: 30rem;
    font-size: 1.05rem;
    line-height: 1.7;
    color: rgba(47, 26, 21, 0.8);
  }

  .feature-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.6rem;
  }

  .feature-row span {
    padding: 0.7rem 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-soft);
    font-weight: 600;
    color: #5a3122;
  }

  .calculator {
    position: relative;
    z-index: 1;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 2rem;
    padding: 1.4rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
      var(--panel);
    box-shadow: var(--shadow-strong);
  }

  .calculator::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, var(--panel-glow), transparent 30%);
    pointer-events: none;
  }

  .display-panel {
    position: relative;
    z-index: 1;
    padding: 1.2rem 1.2rem 1.5rem;
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .history,
  .preview {
    margin: 0;
  }

  .history {
    min-height: 1.4rem;
    color: var(--text-soft);
    font-size: 0.92rem;
  }

  .expression {
    margin: 0.45rem 0 0.85rem;
    min-height: 3.8rem;
    font-size: clamp(2.35rem, 4.1vw, 3.75rem);
    line-height: 1;
    text-align: right;
    word-break: break-all;
    letter-spacing: -0.04em;
  }

  .result-line {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.35rem;
    padding-top: 0.95rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preview {
    color: #ffdca7;
    text-align: right;
    font-weight: 800;
    font-size: clamp(1.8rem, 3.8vw, 3rem);
    line-height: 1;
    letter-spacing: -0.03em;
    text-shadow: 0 0 18px rgba(255, 220, 167, 0.2);
  }

  .keypad {
    position: relative;
    z-index: 1;
    margin-top: 1rem;
  }

  .key-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.85rem;
    margin-top: 0.85rem;
  }

  .key {
    min-height: 4.1rem;
    border: 0;
    border-radius: 1.35rem;
    color: var(--text-main);
    font: inherit;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      filter 0.18s ease;
    box-shadow: 0 12px 18px rgba(0, 0, 0, 0.18);
  }

  .key:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
  }

  .key:active {
    transform: translateY(1px) scale(0.98);
  }

  .key:focus-visible {
    outline: 3px solid rgba(255, 220, 167, 0.9);
    outline-offset: 2px;
  }

  .number {
    background: var(--number-key);
    backdrop-filter: blur(10px);
  }

  .utility {
    background: var(--utility-key);
  }

  .operator {
    background: var(--operator-key);
  }

  .accent {
    background: var(--accent-key);
  }

  .wide {
    grid-column: span 2;
  }

  @media (max-width: 900px) {
    .shell {
      grid-template-columns: 1fr;
      padding: 1.25rem;
    }

    .mesh {
      right: -8rem;
      top: 18%;
      width: 24rem;
      height: 24rem;
    }

    .hero {
      padding: 0.25rem;
    }

    .hero h1 {
      max-width: 10ch;
    }
  }

  @media (max-width: 520px) {
    .grid {
      background-size: 42px 42px;
    }

    .orb-one,
    .orb-two {
      width: 18rem;
      height: 18rem;
    }

    .calculator {
      padding: 1rem;
      border-radius: 1.5rem;
    }

    .display-panel {
      padding: 1rem;
    }

    .expression {
      min-height: 3.2rem;
      font-size: clamp(2rem, 10vw, 2.8rem);
    }

    .result-line {
      padding-top: 0.8rem;
    }

    .preview {
      font-size: clamp(1.55rem, 8vw, 2.3rem);
    }

    .key-row {
      gap: 0.7rem;
      margin-top: 0.7rem;
    }

    .key {
      min-height: 3.6rem;
      border-radius: 1.1rem;
      font-size: 1.1rem;
    }
  }
`;

@Component({
  selector: 'app-root',
  standalone: true,
  template,
  styles: [styles],
})
export class App {
  protected readonly expression = signal('0');
  protected readonly history = signal('Ready for a quick calculation');

  protected readonly displayValue = computed(() => this.expression());
  protected readonly previewValue = computed(() => this.getPreviewValue());

  protected readonly buttons = [
    [
      { label: '\u0043', action: 'clear', variant: 'utility' },
      { label: '\u232b', action: 'backspace', variant: 'utility' },
      { label: '%', action: 'percent', variant: 'utility' },
      { label: '\u00f7', action: 'operator', value: '/', variant: 'operator' },
    ],
    [
      { label: '7', action: 'digit', value: '7', variant: 'number' },
      { label: '8', action: 'digit', value: '8', variant: 'number' },
      { label: '9', action: 'digit', value: '9', variant: 'number' },
      { label: '\u00d7', action: 'operator', value: '*', variant: 'operator' },
    ],
    [
      { label: '4', action: 'digit', value: '4', variant: 'number' },
      { label: '5', action: 'digit', value: '5', variant: 'number' },
      { label: '6', action: 'digit', value: '6', variant: 'number' },
      { label: '\u2212', action: 'operator', value: '-', variant: 'operator' },
    ],
    [
      { label: '1', action: 'digit', value: '1', variant: 'number' },
      { label: '2', action: 'digit', value: '2', variant: 'number' },
      { label: '3', action: 'digit', value: '3', variant: 'number' },
      { label: '+', action: 'operator', value: '+', variant: 'operator' },
    ],
    [
      { label: '0', action: 'digit', value: '0', variant: 'number wide' },
      { label: '.', action: 'decimal', variant: 'number' },
      { label: '=', action: 'equals', variant: 'accent' },
    ],
  ];

  protected handleButtonPress(button: { action: string; value?: string }): void {
    switch (button.action) {
      case 'digit':
        if (button.value) {
          this.appendDigit(button.value);
        }
        break;
      case 'decimal':
        this.appendDecimal();
        break;
      case 'operator':
        if (button.value) {
          this.appendOperator(button.value as Operator);
        }
        break;
      case 'clear':
        this.clearAll();
        break;
      case 'backspace':
        this.backspace();
        break;
      case 'percent':
        this.applyPercent();
        break;
      case 'equals':
        this.calculate();
        break;
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected handleKeyboardInput(event: KeyboardEvent): void {
    const { key } = event;

    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      this.appendDigit(key);
      return;
    }

    if (key === '.') {
      event.preventDefault();
      this.appendDecimal();
      return;
    }

    if (['+', '-', '*', '/'].includes(key)) {
      event.preventDefault();
      this.appendOperator(key as Operator);
      return;
    }

    if (key === 'Enter' || key === '=') {
      event.preventDefault();
      this.calculate();
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      this.backspace();
      return;
    }

    if (key === 'Escape' || key.toLowerCase() === 'c') {
      event.preventDefault();
      this.clearAll();
    }
  }

  private appendDigit(digit: string): void {
    const current = this.expression();

    if (current === '0') {
      this.expression.set(digit);
      return;
    }

    const currentNumber = this.getCurrentNumberSegment(current);
    if (currentNumber === '0') {
      this.expression.set(current.slice(0, -1) + digit);
      return;
    }

    this.expression.update((value) => value + digit);
  }

  private appendDecimal(): void {
    const current = this.expression();
    const currentNumber = this.getCurrentNumberSegment(current);

    if (currentNumber.includes('.')) {
      return;
    }

    if (this.endsWithOperator(current)) {
      this.expression.update((value) => value + '0.');
      return;
    }

    this.expression.update((value) => value + '.');
  }

  private appendOperator(operator: Operator): void {
    const current = this.expression();

    if (current === 'Error') {
      this.expression.set('0');
    }

    if (this.endsWithOperator(this.expression())) {
      this.expression.update((value) => value.slice(0, -1) + operator);
      return;
    }

    this.expression.update((value) => value + operator);
  }

  private clearAll(): void {
    this.expression.set('0');
    this.history.set('Cleared');
  }

  private backspace(): void {
    const current = this.expression();

    if (current.length <= 1 || current === 'Error') {
      this.expression.set('0');
      return;
    }

    this.expression.set(current.slice(0, -1));
  }

  private applyPercent(): void {
    const current = this.expression();

    if (this.endsWithOperator(current) || current === 'Error') {
      return;
    }

    const parts = current.split(/([+\-*/])/);
    const lastValue = parts[parts.length - 1];
    const parsed = Number(lastValue);

    if (Number.isNaN(parsed)) {
      return;
    }

    parts[parts.length - 1] = this.formatNumber(parsed / 100);
    this.expression.set(parts.join(''));
  }

  private calculate(): void {
    const current = this.expression();

    if (this.endsWithOperator(current) || current === 'Error') {
      return;
    }

    const result = this.evaluateExpression(current);

    if (result === null) {
      this.history.set(`Couldn't evaluate ${current}`);
      this.expression.set('Error');
      return;
    }

    this.history.set(`${this.toReadableExpression(current)} = ${result}`);
    this.expression.set(result);
  }

  private getPreviewValue(): string {
    const current = this.expression();

    if (current === '0' || current === 'Error' || this.endsWithOperator(current)) {
      return '';
    }

    const result = this.evaluateExpression(current);

    if (result === null || result === current) {
      return '';
    }

    return `= ${result}`;
  }

  private evaluateExpression(expression: string): string | null {
    const tokens = expression.match(/\d*\.?\d+|[+\-*/]/g);

    if (!tokens?.length) {
      return null;
    }

    const values: number[] = [];
    const operators: Operator[] = [];

    for (const token of tokens) {
      if (['+', '-', '*', '/'].includes(token)) {
        const operator = token as Operator;

        while (
          operators.length &&
          this.precedence(operators[operators.length - 1]) >= this.precedence(operator)
        ) {
          if (!this.applyOperation(values, operators.pop()!)) {
            return null;
          }
        }

        operators.push(operator);
      } else {
        values.push(Number(token));
      }
    }

    while (operators.length) {
      if (!this.applyOperation(values, operators.pop()!)) {
        return null;
      }
    }

    const result = values[0];
    if (!Number.isFinite(result)) {
      return null;
    }

    return this.formatNumber(result);
  }

  private applyOperation(values: number[], operator: Operator): boolean {
    const right = values.pop();
    const left = values.pop();

    if (left === undefined || right === undefined) {
      return false;
    }

    switch (operator) {
      case '+':
        values.push(left + right);
        return true;
      case '-':
        values.push(left - right);
        return true;
      case '*':
        values.push(left * right);
        return true;
      case '/':
        if (right === 0) {
          return false;
        }
        values.push(left / right);
        return true;
    }
  }

  private precedence(operator: Operator): number {
    return operator === '+' || operator === '-' ? 1 : 2;
  }

  private endsWithOperator(value: string): boolean {
    return /[+\-*/]$/.test(value);
  }

  private getCurrentNumberSegment(value: string): string {
    const parts = value.split(/[+\-*/]/);
    return parts[parts.length - 1] ?? '';
  }

  private formatNumber(value: number): string {
    if (Number.isInteger(value)) {
      return value.toString();
    }

    return parseFloat(value.toFixed(10)).toString();
  }

  private toReadableExpression(value: string): string {
    return value.replaceAll('*', '\u00d7').replaceAll('/', '\u00f7').replaceAll('-', '\u2212');
  }
}
