import React from 'react';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { noop } from 'lodash';

import { isPropValidDate } from '../../util/prop-validators';
import isParseableDate from '../../util/isParseableDate';

import PopoverTrigger from '../../containers/popover/PopoverTrigger';
import Icon from '../../base/icons/Icon';
import Textbox from '../../controls/textbox/Textbox';
import DatePicker from '../../controls/datepicker/DatePicker';

const dateFormat = 'M/D/YYYY';

export default class DatePickerTextbox extends React.Component {
  static propTypes = {
    labelText: PropTypes.string.isRequired,
    /** Textbox component used to trigger the DatePicker display */
    textComponent: PropTypes.func,
    /** Function to execute with the formatted date */
    dateSelected: PropTypes.func,
    /** The currently selected date */
    preselectedDate: isPropValidDate,
    /** Props that will propagate to the DatePicker component */
    datePickerProps: PropTypes.object
  };

  static defaultProps = {
    dateSelected: noop,
    handleTextboxChanged: noop,
    handleTextboxFocusLost: noop,
    datePickerProps: {},
    textComponent: Textbox
  };

  constructor(props) {
    super(props);

    this.state = {
      displayPicker: false,
      previouslyDisplayed: false,
      preselectedDate: props.preselectedDate
    };

    this.handleDateSelected = this.handleDateSelected.bind(this);
    this.dateTextboxChanged = this.dateTextboxChanged.bind(this);
    this.dateTextboxFocusLost = this.dateTextboxFocusLost.bind(this);
    this.displayPicker = this.displayPicker.bind(this);
    this.hidePicker = this.hidePicker.bind(this);
    this.togglePicker = this.togglePicker.bind(this);
    this.setPopoverTarget = this.setPopoverTarget.bind(this);
  }

  componentWillReceiveProps({ preselectedDate }) {
    this.setState(() => ({ preselectedDate }));
  }

  setPopoverTarget(ref) {
    this.popoverTarget = ref.prependRef;
  }

  togglePicker() {
    this.setState(previousState => ({
      displayPicker: !previousState.displayPicker
    }));
  }

  displayPicker() {
    if (!this.state.previouslyDisplayed) {
      this.setState(() => ({ displayPicker: true }));
    }
  }

  hidePicker() {
    this.setState(() => ({ displayPicker: false, previouslyDisplayed: true }));
  }

  handleDateSelected(dateSelected) {
    this.hidePicker();
    const formattedDate = format(dateSelected, dateFormat);
    this.setState(() => ({ preselectedDate: formattedDate }));
    this.props.dateSelected(formattedDate);
  }

  dateTextboxChanged() {
    this.setState(() => ({ preselectedDate: undefined }));
  }

  dateTextboxFocusLost(textboxValue) {
    const stateChange = { previouslyDisplayed: false };
    if (isParseableDate(textboxValue)) {
      const formattedDate = format(textboxValue, dateFormat);
      this.setState(() =>
        Object.assign({}, stateChange, { preselectedDate: formattedDate })
      );
      this.props.dateSelected(parse(formattedDate));
    } else {
      this.setState(() => stateChange);
    }
  }

  render() {
    const { labelText, datePickerProps, textComponent } = this.props;
    const { displayPicker, preselectedDate } = this.state;
    const prependedIcon = <Icon name="calendar" />;

    const popoverContent = (
      <DatePicker
        dateSelected={this.handleDateSelected}
        preselectedDate={preselectedDate}
        {...datePickerProps}
      />
    );

    const textProps = {
      ref: this.setPopoverTarget,
      labelText,
      prependContent: prependedIcon,
      onFocus: this.displayPicker,
      onClick: this.togglePicker,
      handleOnChange: this.dateTextboxChanged,
      handleFocusLost: this.dateTextboxFocusLost,
      initialValue: format(preselectedDate, dateFormat),
      ...this.props
    };

    return (
      <PopoverTrigger
        popoverContent={popoverContent}
        popoverTarget={this.popoverTarget}
        shouldDisplayPopover={displayPicker}
        onHideOverlay={this.hidePicker}
        containsFormElement
        popoverPlacement="top"
      >
        {React.createElement(textComponent, textProps)}
      </PopoverTrigger>
    );
  }
}