const ITEM_WIDTH = 150;
const RADIUS = 8;

class Legend extends View {

    constructor(parent, colorDomain, colorScale) {
        super({ parentElement: parent}, [], '');
        this.colorDomain = colorDomain;
        this.colorScale = colorScale;
    }

    set(colorDomain, colorScale) {
        this.colorDomain = Array.from(colorDomain);
        this.colorScale = colorScale;
    }

    getData() {
        return this.colorDomain ? this.colorDomain : [];
    }

    initVis() {
        super.initVis();
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        super.updateVis();
        let vis = this;
        vis.renderVis();
    }

    renderVis() {
        super.renderVis();
        let vis = this;
        if (vis.items) {
            vis.items.remove();
        }
        vis.items = vis.getChart().selectAll('circle')
            .data(vis.getData(), d => d)
            .join('g')
            .attr('transform', d => vis.positionLegendItem(vis.getData().indexOf(d), 3));
        vis.items.append('circle')
            .attr('r', RADIUS)
            .attr('fill', d => vis.colorScale(d));
        vis.items.append('text')
            .text(d => d)
            .attr('transform', `translate(${RADIUS+5}, 0)`);
    }

    // Algorithm to compute position of a legend item dynamically. We enforce
    // a maximum of n items vertically and extend in the horizontal direction
    positionLegendItem (i, n) {
        let vis = this;
        const itemHeight = vis.getHeight() / n;
        let y = i % n;
        let x = (i - y) / n;
        return `translate(${x*ITEM_WIDTH}, ${y*itemHeight})`;
    }

}