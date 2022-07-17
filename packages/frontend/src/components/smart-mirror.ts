import { styleMap } from 'lit/directives/style-map.js';
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import {
  BoardSetup,
  MirrorSetup,
  PluginDefinition,
  Server2Client,
  WidgetConfig,
} from '@smartmirror.one/types';

import SocketServer from './socket-server';
import './widget-wrapper';

@customElement('smart-mirror')
export class SmartMirror extends LitElement {
  @state() socket: SocketServer;
  @state() boardSetup: BoardSetup;
  @state() widgets: WidgetConfig[] = [];
  @state() plugins: PluginDefinition[] = [];

  static styles = [
    css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      font-family: var(--font-sans);
      color: var(--fg);
      background-color: var(--bg);
    }
    .stage {
      display: grid;
      width: 100%;
      height: 100%;
      grid-template-columns: repeat(var(--width), 1fr);
      grid-template-rows: repeat(var(--height), 1fr);
    }`,
  ];

  connectedCallback(): void {
    this.socket = new SocketServer('ws://localhost:3000');
    this.socket.addEventListener(
      Server2Client.connect,
      () => this.setupBoard(),
    );
    this.socket.addEventListener(
      Server2Client.setup,
      (ev: MirrorSetup) => this.handleSetup(ev),
    );
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    this.socket.removeEventListener(
      Server2Client.connect,
      () => this.setupBoard(),
    );
    this.socket.removeEventListener(
      Server2Client.setup,
      (ev: MirrorSetup) => this.handleSetup(ev),
    );
    super.disconnectedCallback();
  }

  setupBoard() {
    this.socket.send('requestSetup');
  }

  handleSetup(payload: MirrorSetup) {
    this.boardSetup = { ...payload.boardSetup };
    this.widgets = [ ...payload.widgets ];
    this.plugins = [ ...payload.plugins ];
  }

  calculateFontSizeBase() {
    const landscape = window.innerWidth >= window.innerHeight;
    const length = landscape ? window.innerHeight : window.innerWidth;
    /* 32.5 just "felt good". We can play around with this if we get feedback */
    const ratio = Math.floor(length / 32.5);
    return { '--base': `${ratio}px` };
  }

  renderWidget(widgetConfig: WidgetConfig) {
    const styles = styleMap({
      border: this.boardSetup.testMode ? '1px solid var(--fg)' : null,
      'grid-column': `${widgetConfig.position.left} / span ${widgetConfig.position.width}`,
      'grid-row': `${widgetConfig.position.top} / span ${widgetConfig.position.height}`,
    });

    const { plugin: reqPlugin, widget: reqWidget } = widgetConfig;
    const pluginDef = this.plugins.find(
      p => p.name === reqPlugin && Object.prototype.hasOwnProperty.call(p.widgets, reqWidget),
    );
    const widgetDef = pluginDef.widgets[reqWidget];
    const refreshRate = widgetDef.refreshRate
      ? +(widgetConfig.refreshRate || widgetDef.refreshRate)
      : null;

    return html`
      <widget-wrapper
        element-id=${widgetConfig.id}
        .data=${widgetConfig.data}
        .css=${widgetDef.css}
        .html=${widgetDef.html}
        .js=${widgetDef.frontend}
        .inputs=${widgetConfig.inputs}
        .refreshRate=${refreshRate}
        style=${styles}>
      </widget-wrapper>
    `;
  }

  render() {
    const stageStyle = styleMap({
      '--height': this.boardSetup ? this.boardSetup.height.toString() : '',
      '--width': this.boardSetup ? this.boardSetup.width.toString() : '',
      ...this.calculateFontSizeBase(),
    });
    return html`
      <div class="stage" style=${stageStyle}>
        ${this.widgets.map((w) => this.renderWidget(w))}
      </div>
    `;
  }
}