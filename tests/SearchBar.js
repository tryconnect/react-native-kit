"use strict";
import React from 'react';
import SearchBar from '../src/components/SearchBar';

class TestSearchBar extends React.Component {
    static displayName = "@TestSearchBar";

    render() {

        return (
            <SearchBar
                goBack
            >
            </SearchBar>
        );
    }

}

const _styles = {
};

export default TestSearchBar;

