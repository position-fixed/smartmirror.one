import { customElement, property, queryAll } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

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

  protected async firstUpdated(): Promise<void> {
    this.executeFunction('start');
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
    <div .innerHTML=${[
    ...this.css.map(style => `<style>${style}</style>`),
    ...this.html,
  ].join('')}>
      
    </div>
    `;
  }
}