import React from 'react';

export default class AdComponent extends React.Component {
    componentDidMount() {
        try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        return this.props.children;
    }
}