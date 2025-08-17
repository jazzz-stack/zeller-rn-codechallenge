const React = require('react');

const PagerView = ({ children, ...props }) => {
  return React.createElement('div', { ...props }, children);
};

module.exports = PagerView;
module.exports.default = PagerView;
