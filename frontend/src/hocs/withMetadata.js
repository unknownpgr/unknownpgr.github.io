import React, { Component } from 'react';

// Cache metadata because it is always constant
let __isInit = true;
let __metadata = {};

function withMetadata(Child) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        meta: __metadata
      };
    }

    async componentDidMount() {
      if (!__isInit) return;
      let meta = await (await fetch('/meta.json?hash=' + Date.now())).json();
      __isInit = false;
      __metadata = meta;
      this.setState({ meta });
    }

    render() {
      return <Child meta={this.state.meta} {...this.props}></Child>;
    }
  };
}

export default withMetadata;