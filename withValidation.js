/**
 *
 * Simple High Order Component to handle form validation
 *
 */

import React, { Component } from "react"

const isEmpty = v => !v || v.trim().length === 0

const emailPattern = /^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-z0-9-]+\.)+[a-z]{2,63}$/gi

const isValidEmail = email => new RegExp(emailPattern).test(email)

export const withFormValidation = WrappedComponent => {
  const C = class extends Component {
    constructor(props) {
      super(props)
      this.state = {
        fields: {}
      }
      this.registerInput = this.registerInput.bind(this)
      this.validate = this.validate.bind(this)
    }

    registerInput(name, ref, validation) {
      const newObj = {}

      newObj[name] = { ref, validation }

      this.setState(prevState => ({
        fields: { ...prevState.fields, ...newObj }
      }))
    }

    getReCAPTCHAVal(recaptcha) {
      return recaptcha.current.getValue()
    }

    validateReCAPTCHA(errors = {}) {
      if (!this.getReCAPTCHAVal()) {
        errors["recaptcha"] = "empty"
      }
      return errors
    }

    validateFieldEmail(errors = {}, field) {
      const fieldEmail = this.elements[field].current.value

      errors = this.validateFieldEmpty(errors, field)
      if (!errors[field] && !isValidEmail(fieldEmail)) {
        errors[field] = "email-not-valid"
      }
      return errors
    }

    validate() {
      const { fields } = this.state

      return Object.keys(fields).reduce((errors, name) => {
        const vObj = fields[name]

        if (!vObj.ref || !vObj.ref.current) {
          console.log(`field ${name} ref is missing`)
          return errors
        } else {
          let value

          if (vObj.ref.current && !vObj.ref.current.getAttribute) {
            console.log("okookoko", vObj.ref.current)
          }

          if (
            vObj.ref.current &&
            vObj.ref.current.getAttribute &&
            vObj.ref.current.getAttribute("type") !== "checkbox"
          ) {
            value = vObj.ref.current.value
          } else {
            value = vObj.ref.current.checked
          }

          if (vObj.validation === "checked") {
            if (!errors[name] && !value) {
              errors[name] = "not-checked"
            }
          }

          if (vObj.validation === "empty" || vObj.validation === "email") {
            if (isEmpty(value)) {
              errors[name] = "empty"
            }
          }

          if (vObj.validation === "email") {
            if (!errors[name] && !isValidEmail(value)) {
              errors[name] = "email-not-valid"
            }
          }

          if (vObj.validation === "recaptcha") {
            if (!this.getReCAPTCHAVal(vObj.ref.current)) {
              errors[name] = "recaptcha"
            }
          }

          return errors
        }
      }, {})
    }

    render() {
      return (
        <WrappedComponent
          validate={this.validate}
          registerInput={this.registerInput}
          {...this.props}
        />
      )
    }
  }

  C.displayName = `${WrappedComponent.displayName || WrappedComponent.name}`

  return C
}

export const ErrorMessage = ({ show, message, center }) => {
  if (show && center) {
    return (
      <span className="invalid-feedback" style={center}>
        {message}
      </span>
    )
  } else if (show && !center) {
    return <span className="invalid-feedback">{message}</span>
  } else return ""
}
