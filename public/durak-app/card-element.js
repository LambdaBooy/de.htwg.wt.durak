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
                    width: 90px; 
                    margin-top: 5px; 
                    margin-right: 5px;
                    margin-left: 5px;
                }`];
    }

    render() {
        return html`
            <img id=${this.id} src=${this.src}/>
        `;
    }
}
customElements.define('card-element', Card);
