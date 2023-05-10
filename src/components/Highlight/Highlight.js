import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

Highlight.propTypes = {
  indices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  source: PropTypes.string,
};

const HighlightElement = styled.span`
  color: var(--sn-launcher-brand);
`;

function Highlight({ indices, source }) {
  const wrapIndicesInSpan = React.useCallback((indicesArr, str) => {
    // Sort the indicesArr by start position
    indicesArr.sort((a, b) => a[0] - b[0]);
    indicesArr = indicesArr.filter((item, index) => {
      const [start, end] = item;

      const previous = indicesArr.slice(0, index);

      return !previous.some((prev) => {
        const [prevStart, prevEnd] = prev;
        return (start >= prevStart && end <= prevEnd) || (start <= prevStart && end >= prevEnd);
      });
    });

    let result = [];
    let currentIndex = 0;

    for (const [start, end] of indicesArr) {
      // Append the part of the string before the current match
      result.push(str.slice(currentIndex, start));

      // Wrap the current match in a span and push it to the result array
      const matched = str.slice(start, end + 1);
      result.push(<HighlightElement key={start}>{matched}</HighlightElement>);

      currentIndex = end + 1;
    }

    // Append the remaining part of the string after the last match
    result.push(str.slice(currentIndex));

    return result;
  }, []);

  if (!indices || indices <= 0) return source;

  return <>{wrapIndicesInSpan(indices, source)}</>;
}

export default Highlight;
