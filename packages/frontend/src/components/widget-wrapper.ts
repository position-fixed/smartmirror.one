import { css, html, LitElement } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';

@customElement('widget-wrapper')
class _WidgetWrapper extends LitElement {
  @property({ attribute: 'element-id' }) elementId: string;

  @property({ type: Array }) css: string[];
  @property({ type: Array }) html: string[];
  @property({ type: Object }) js: Record<string, string>;
  @property({ type: Object }) inputs: Record<string, unknown>;
  @property({ type: Number }) refreshRate: number;
  @property({ type: Object }) data: Record<string, unknown>;
  interval: number;

  @queryAll('[id]') elems: HTMLElement[];

  connectedCallback() {
    window.addEventListener('widgetUpdate', (ev: CustomEvent) => this.onWidgetUpdate(ev));
    super.connectedCallback();
  }

  static styles = css`
    h1, h2, h3, h4, h5, h6 {
      margin: unset;
      font-weight: inherit;
    }
    /*
      Based on Major Third scaling.
      We're using calc() because we set --base in <smart-mirror>
    */
    h1 { font-size: calc(var(--base) * 1.25 * 1.25 * 1.25 * 1.25); }
    h2 { font-size: calc(var(--base) * 1.25 * 1.25 * 1.25 * 1.25); }
    h3 { font-size: calc(var(--base) * 1.25 * 1.25 * 1.25); }
    h4 { font-size: calc(var(--base) * 1.25 * 1.25); }
    h5 { font-size: calc(var(--base) * 1.25); }
    h6 { font-size: var(--base); }
    p { font-size: var(--base); }
    small { font-size: calc(var(--base) / 1.25); }
  `;

  protected async firstUpdated(): Promise<void> {
    const hasDedicatedInit = Object.prototype.hasOwnProperty.call(this.js, 'start');
    this.executeFunction(hasDedicatedInit ? 'start' : 'update');
    if (this.refreshRate) {
      this.interval = window.setInterval(
        () => this.requestWidgetMethod('update'),
        this.refreshRate,
      );
    }
  }

  disconnectedCallback(): void {
    window.removeEventListener('widgetUpdate', (ev: CustomEvent) => this.onWidgetUpdate(ev));
    if (this.refreshRate) {
      window.clearInterval(this.interval);
    }
    super.disconnectedCallback();
  }

  requestWidgetMethod(method: string) {
    window.dispatchEvent(new CustomEvent('requestMethod', {
      detail: {
        data: this.data,
        id: this.elementId,
        method,
      },
    }));
  }

  onWidgetUpdate(ev: CustomEvent) {
    if (ev.detail.id === this.elementId) {
      this.data = ev.detail.update;
      this.executeFunction('update');
    }
  }

  executeFunction(name: string) {
    const targetFunction = this.js[name];

    const context = {
      data: this.data,
      elements: {},
      inputs: { ...this.inputs },
    };

    if (targetFunction) {
      for (const el of this.elems) {
        context.elements[el.id] = el;
      }
      new Function('context', targetFunction)(context);
    }
  }

  render() {
    return html`
    <div style="min-height: 100%;" .innerHTML=${[
    ...this.css.map(style => `<style>${style}</style>`),
    ...this.html,
  ].join('')}>
      
    </div>
    `;
  }
}