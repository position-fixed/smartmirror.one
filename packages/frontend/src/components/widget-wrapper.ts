import { LitElement, html } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators';

@customElement('widget-wrapper')
class WidgetWrapper extends LitElement {
  @property() elementId: string;

  @property({ type: Array }) css: string[];
  @property({ type: Array }) html: string[];
  @property({ type: Object }) js: Record<string, string>;
  @property({ type: Object }) inputs: Record<string, unknown>;

  @queryAll('[id]') elems: HTMLElement[];

  connectedCallback(): void {
    super.connectedCallback();
  }

  protected firstUpdated(): void {
    this.executeFunction('start');
  }

  executeFunction(name: string) {
    const targetFunction = this.js[name];

    const context = {
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
    `
  }
}