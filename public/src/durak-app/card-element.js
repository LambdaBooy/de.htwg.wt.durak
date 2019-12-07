import { LitElement, html, css } from "https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module";

class Card extends LitElement {
    static get properties() {
        return {
            id: { type: String },
            src: { type: String }
        };
    }

    static get styles() {
        return [
            super.styles,
            css`
                img { 
                    width: 80px; 
                    margin: 10px; 
                }`];
    }

    render() {
        return html`
            <img id=${this.id} src=${this.src}/>
        `;
    }
}
customElements.define('card-element', Card);
