import { mathjax } from 'mathjax-full/js/mathjax';
import * as sharp from "sharp";

import { liteAdaptor, LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { TeX } from "mathjax-full/js/input/tex";
import { SVG } from "mathjax-full/js/output/svg";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";

import { HTMLHandler } from "mathjax-full/js/handlers/html/HTMLHandler";
import { LiteElement } from "mathjax-full/js/adaptors/lite/Element";
import { LiteDocument } from "mathjax-full/js/adaptors/lite/Document";
import { LiteText } from "mathjax-full/js/adaptors/lite/Text";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";
import { MathDocument } from "mathjax-full/js/core/MathDocument";

export class Renderer {
    private readonly adaptor: LiteAdaptor;
    private readonly handler: HTMLHandler<LiteElement | LiteText, LiteText, LiteDocument>;
    private readonly tex: TeX<LiteElement, LiteText, LiteDocument>;
    private readonly svg: SVG<LiteElement, LiteText, LiteDocument>;
    private readonly root: MathDocument<LiteElement, LiteText, LiteDocument>;

    constructor() {
        this.adaptor = liteAdaptor();
        this.handler = RegisterHTMLHandler(this.adaptor);
        this.tex = new TeX({
            packages: AllPackages
        });
        this.svg = new SVG({
            fontCache: 'none'
        });
        this.root = mathjax.document('', {
            InputJax: this.tex,
            OutputJax: this.svg
        });
    }

    async render(formula: string): Promise<Buffer> {
        // The cast is guaranteed to be safe, since the output is SVG, not MathML
        let node = this.root.convert(formula, {
            display: true
        }) as LiteElement;
        node = this.adaptor.firstChild(node) as LiteElement;

        const dims_ex = {
            width: this.adaptor.getAttribute(node, 'width') as string,
            height: this.adaptor.getAttribute(node, 'height') as string
        };

        // Cut off the 'ex' ending from the strings
        dims_ex.width = dims_ex.width.substr(0, dims_ex.width.length - 2);
        dims_ex.height = dims_ex.height.substr(0, dims_ex.height.length - 2);

        // Dimensions in pixels. 16 is a magic constant.
        const dims = {
            width: Math.ceil(parseFloat(dims_ex.width) * 16),
            height: Math.ceil(parseFloat(dims_ex.height) * 16)
        };

        this.adaptor.setAttribute(node, 'width', `${dims.width}px`);
        this.adaptor.setAttribute(node, 'height', `${dims.height}px`);

        const svg = this.adaptor.outerHTML(node);
        return sharp(Buffer.from(svg))
            .extend({
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
                background: '#ffffff'
            })
            .flatten({
                background: '#ffffff'
            })
            .png()
            .toBuffer();
    }
}
