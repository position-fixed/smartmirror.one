import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { MirrorSetup, MirrorElement } from '@smartmirror.one/types';

import SocketServer from './socket-server';

@customElement('smart-mirror')
class SmartMirror extends LitElement {
  @state() socket: SocketServer;
  @state() setup: MirrorSetup;
  @state() elements: MirrorElement[] = [];

  static styles = [
    css`
    :host {
      --fg: hsl(0, 0%, 100%);
      --bg: hsl(0, 0%, 0%);
      display: block;
      width: 100%;
      height: 100%;
      font-family: sans-serif;
      color: var(--fg);
      background-color: var(--bg);
    }
    .stage {
      display: grid;
      width: 100%;
      height: 100%;
      grid-template-columns: repeat(var(--width), 1fr);
      grid-template-rows: repeat(var(--height), 1fr);
    }`
  ];

  connectedCallback(): void {
    this.socket = new SocketServer('ws://localhost:3000');
    this.socket.addEventListener('connect', () => this.setupBoard());
    this.socket.addEventListener('setup', (ev: MirrorSetup) => this.handleSetup(ev));
    this.socket.addEventListener('elementUpdate', (ev: MirrorElement[]) => this.handleElementUpdate(ev));
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    this.socket.removeEventListener('connect', () => this.setupBoard());
    this.socket.removeEventListener('setup', (ev: MirrorSetup) => this.handleSetup(ev));
    this.socket.removeEventListener('elementUpdate', (ev: MirrorElement[]) => this.handleElementUpdate(ev));
    super.disconnectedCallback();
  }

  setupBoard() {
    this.socket.send('requestSetup');
  }

  handleSetup(payload: MirrorSetup) {
    this.setup = {...payload};
  }

  handleElementUpdate(payload: MirrorElement[]) {
    this.elements = [...payload];
  }

  renderMirrorElement(elem: MirrorElement) {
    const styles = styleMap({
      'grid-column': `${elem.position.left} / span ${elem.position.width}`,
      'grid-row': `${elem.position.top} / span ${elem.position.height}`,
      border: this.setup.testMode ? '1px solid var(--fg)' : null,
    });
    return html`
      <p style=${styles}>${elem.content}</p>
    `;
  }

  render() {
    const stageStyle = styleMap({
      '--width': this.setup ? this.setup.width.toString() : '',
      '--height': this.setup ? this.setup.height.toString() : '',
    });
    return html`
      <div class="stage" style=${stageStyle}>
        ${this.elements.map((e) => this.renderMirrorElement(e))}
      </div>
    `;
  }
}