import React, { Component, useState } from 'react';


class Test extends Component {

    constructor(props) {
        super(props)
        this.state = {
            child: undefined
        }
        this.importModule = this.importModule.bind(this)
    }

    componentDidMount() {
        // We should update state after component is mounted.
        import('./Custom').then(this.importModule)
    }


    importModule(module) {
        const Custom = module.default
        console.log(module, Custom)
        this.setState({ child: <Custom></Custom> })
    }

    render() {
        return (
            <div>
                This is my test Component
                <div> and this is my json : {this.state.child}</div>
            </div>
        );
    }
}

export default Test;