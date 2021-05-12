import React from 'react';
import withMetadata from "hocs/withMetadata";
import { Link, withRouter } from "react-router-dom";
import mapDict from "libs/mapDict";
import './categories.scss';

function Categories({ meta }) {

    let categories = {};
    {
        let totalCount = 0;
        for (let key in meta) {
            let { category } = meta[key];
            if (categories[category] === undefined) categories[category] = { link: `/categories/${category}`, count: 1 };
            else categories[category].count++;
            totalCount++;
        }
        categories = { all: { link: '/', count: totalCount }, ...categories };
    }

    return (
        <div className={'categories'}>
            <ul>
                {mapDict(categories, (category, { link, count }) => {
                    return (
                        <li>
                            <Link
                                key={category}
                                to={link}>
                                {`${category}(${count})`}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}


export default withRouter(withMetadata(Categories));