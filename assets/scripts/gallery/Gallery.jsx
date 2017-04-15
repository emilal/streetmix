/**
 * Gallery
 *
 * Displays a user's streets
 *
 */
import React from 'react'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import Avatar from '../app/Avatar'
import GalleryStreetItem from './GalleryStreetItem'
import { switchGalleryStreet, repeatReceiveGalleryData } from './view'
import { getSignInData, isSignedIn } from '../users/authentication'
import { URL_NEW_STREET, URL_NEW_STREET_COPY_LAST } from '../app/routing'
import { msg } from '../app/messages'

function getStreetCountText (count) {
  let text
  switch (count) {
    case 0:
      text = msg('STREET_COUNT_0')
      break
    case 1:
      text = msg('STREET_COUNT_1')
      break
    default:
      text = msg('STREET_COUNT_MANY', { streetCount: count })
      break
  }
  return text
}

class Gallery extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selected: null,
      preventHide: false
    }

    this.selectStreet = this.selectStreet.bind(this)
    this.scrollSelectedStreetIntoView = this.scrollSelectedStreetIntoView.bind(this)
  }

  componentDidMount () {
    this.scrollSelectedStreetIntoView()
  }

  componentDidUpdate () {
    this.scrollSelectedStreetIntoView()
  }

  selectStreet (street) {
    this.setState({
      selected: street.id,
      preventHide: false
    })
    switchGalleryStreet(street.id)
  }

  scrollSelectedStreetIntoView () {
    if (this.state.selected) {
      // selectedEl.scrollIntoView()
      // galleryEl.scrollTop = 0
    }
  }

  render () {
    let childElements

    switch (this.props.mode) {
      case 'SIGN_IN_PROMO':
        childElements = (
          <div className='gallery-sign-in-promo'>
            <a href='/twitter-sign-in?redirectUri=/just-signed-in'>Sign in with Twitter for your personal street gallery</a>
          </div>
        )
        break
      case 'LOADING':
        childElements = (
          <div className='gallery-loading' data-i18n='msg.loading'>Loading…</div>
        )
        break
      case 'ERROR':
        childElements = (
          <div className='gallery-error'>
            <span data-i18n='gallery.fail'>Failed to load the gallery.</span>
            <button id='gallery-try-again' data-i18n='btn.try-again' onClick={repeatReceiveGalleryData}>Try again</button>
          </div>
        )
        break
      case 'GALLERY':
      default:
        let label

        // Displays user avatar and twitter link if showing a user's streets,
        // otherwise it shows the label "all streets"
        if (this.props.userId) {
          label = (
            <div className='gallery-label'>
              <Avatar userId={this.props.userId} />
              <div className='gallery-user-id'>
                {this.props.userId}
                <a
                  href={`https://twitter.com/${this.props.userId}`}
                  className='twitter-profile'
                  target='_blank'
                  data-i18n='gallery.twitter-link'
                >
                  Twitter profile »
                </a>
              </div>
            </div>
          )
        } else {
          label = <div className='gallery-label' data-i18n='gallery.all'>All streets</div>
        }

        // Applies a class to the containing element if no user ID is provided
        // (which displays all streets) or if the user ID provided is different
        // from a currently signed-in user
        let galleryFullWidthClass
        if (!this.props.userId || !(isSignedIn() && (this.props.userId === getSignInData().userId))) {
          galleryFullWidthClass = 'gallery-streets-container-full'
        }

        // Display these buttons for a user viewing their own gallery
        let buttons
        if (isSignedIn() && (this.props.userId === getSignInData().userId)) {
          buttons = (
            <div className='gallery-user-buttons'>
              <a className='button-like' id='new-street' href={`/${URL_NEW_STREET}`} target='_blank' data-i18n='btn.create'>
                Create new street
              </a>
              <a className='button-like' id='copy-last-street' href={`/${URL_NEW_STREET_COPY_LAST}`} target='_blank' data-i18n='btn.copy'>
                Make a copy
              </a>
            </div>
          )
        }

        const items = this.props.streets.map((item) => {
          const isSelected = this.state.selected === item.id
          return (
            <GalleryStreetItem
              key={item.id}
              street={item}
              selected={isSelected}
              handleSelect={this.selectStreet}
            />
          )
        })
        const streetCount = (this.props.userId) ? (
          <div className='street-count'>{getStreetCountText(this.props.streets.length)}</div>
        ) : null

        childElements = (
          <div>
            {label}

            {streetCount}

            <div className={'gallery-streets-container ' + galleryFullWidthClass}>
              {buttons}
              <Scrollable className='streets'>
                {items}
              </Scrollable>
            </div>
          </div>
        )
        break
    }

    return (
      <div id='gallery'>
        {childElements}
      </div>
    )
  }
}

Gallery.propTypes = {
  visible: React.PropTypes.bool,
  userId: React.PropTypes.string,
  mode: React.PropTypes.string,
  streets: React.PropTypes.array
}

function mapStateToProps (state) {
  return {
    visible: state.gallery.visible,
    userId: state.gallery.userId,
    mode: state.gallery.mode,
    streets: state.gallery.streets
  }
}

export default connect(mapStateToProps)(Gallery)