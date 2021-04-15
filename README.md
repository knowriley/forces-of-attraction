# Forces of Attraction
## Project Structure
Our file layout is virtually identical to the templates provided throughout the course for the assignments. The `js` directory contains the majority of our logic and visualization
definitions, `index.html` contains the layout, and `styles/style.css` contains some additional styling directives. The components are organized as follows:
- `main.js`: The entrypoint of our project. Includes main data processing functions.
- `barChart.js`: Contains the Bar Chart.
- `View.js`: A reusable superclass that abstracts away some of the common component patterns. Used by the force-directed graph.
- `forceDirectedGraph.js`: Contains the Graph View. Extends the `View` class.
- `Legend.js`: The group color legend.
- `matrix.js`: The matrix.
- `utils.js`: Random utility functions that are commonly used by all components and the data processing.

We have also initialized our `js` directory as an NPM module, in order to use `eslint` as a code-quality checker.
## Tasks to Complete
Please see the [issues page](https://github.students.cs.ubc.ca/cpsc436v-2020w-t2/436v-project_l9o1b_q9l1b_r6w0b/issues) for a list of tasks that still need to be done, or visit the [project view](https://github.students.cs.ubc.ca/cpsc436v-2020w-t2/436v-project_l9o1b_q9l1b_r6w0b/projects/1) to see task status and completion.
## Data
Dataset is from experimental speed dating events by Columbia Business School professors Ray Fisman and Sheena Iyengar for their paper Gender Differences in Mate Selection: Evidence From a Speed Dating Experiment (​https://www.kaggle.com/annavictoria/speed-dating-experiment​).
## References
### Project-Wide
- Built skeleton structure based off of previous programming assignment boilerplate
### Force-Directed Graph
- Basic structure based on [this example](https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-force-directed-graph?file=/css/style.css:212-236) from the Advanced Concepts tutorial.
- Learned how to update the force-simulation from [Modifying a Force-Directed Graph](https://observablehq.com/@d3/modifying-a-force-directed-graph) by Mike Bostock.
- Learned how to make nodes draggable in [this notebook](https://observablehq.com/@d3/force-directed-graph).
- Used [this case study](https://github.com/UBC-InfoVis/2021-436V-case-studies/blob/097d13b05d587f4fab3e3fcd23f5e99274397c2c/case-study_measles-and-vaccines/css/style.css) for tooltip style and techniques.
- Learned how to make and include slider from [d3-simple-slider](https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518).
### Matrix
- Used [this case study](https://github.com/UBC-InfoVis/2021-436V-case-studies/blob/097d13b05d587f4fab3e3fcd23f5e99274397c2c/case-study_measles-and-vaccines/css/style.css) for tooltip style and techniques.
- https://bl.ocks.org/mbostock/4403522
- https://stackoverflow.com/a/32658330

### Line Chart
- Used these references as guides to create linechart and its area component
    - line: https://github.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-annotated-line-chart
    - area: https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252

### Misc.
Other small aspects of our code have their source of inspiration or direct reference cited as
inline links in our source-code. Doing this allows quick navigation to sources from within the code
and allows us to manage references through version control more easily.
