import React from 'react';

import CommitsTable from './CommitsTable';
import ActionButtons from './ActionButtons';

const AUTOLAND_POST_ENDPOINT = '...';

class AutolandController extends React.Component {

  defaultState = { data: null, error: null };

  constructor(props) {
    super(props);
    this.state = this.defaultState;
    this.sendPost = this.sendPost.bind(this);
  }

  componentDidMount() {
    this.fetch(this.props.params.series_id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.series_id !== nextProps.params.series_id) {
      this.fetch(nextProps.params.series_id);
    }
  }

  resetStateWithUpdates(stateUpdates) {
    this.setState({ ...this.defaultState, ...stateUpdates });
  }

  fetch(commits) {
    fetch(`/__tests__/fixtures/${commits}.json`)
      .then(response => {
        if (response.status === 404) {
          this.resetStateWithUpdates({
            error: 'Data for this commit set could not be found.',
          });
          return;
        }

        response.json().then(data => {
          this.resetStateWithUpdates({ data });
        })
        .catch(() => {
          this.resetStateWithUpdates({
            error: 'Data for this commit set could not be parsed.',
          });
        });
      });
  }

  sendPost() {
    fetch(AUTOLAND_POST_ENDPOINT, { method: 'post' })
      .catch(() => {
        this.resetStateWithUpdates({
          error: 'Request to land commits has failed.',
        });
      })
      .then(response => {
        response.json().then(data => {
          /* What to do? */
          if (data) { return; }
          if (this) { return; }
        })
        .catch(() => {
          this.resetStateWithUpdates({
            error: 'Response from landing request could not be parsed.',
          });
        });
      });
  }

  render() {
    const data = this.state.data;

    // Error!  One example could be a 404 for a bad ID
    if (this.state.error !== null) {
      return <span className="warning">{this.state.error}</span>;
    }

    // This is the default text for the element while we fetch data
    // during the initial widget creation
    if (data === null) {
      return <span className="fetching-data">Fetching data...</span>;
    }

    // For now, the only push that matters is the first provided back
    const push = data.pushes && data.pushes[0];
    const landing = data.landings && data.landings[0];
    const failures = {};
    let failureCount = 0;

    // Messages blurbs based on current state of the push information
    // Defaulting to "all good, here's what you want to land"
    let message = (
      <div>
        <h2>Everything looks good!</h2>
        <p>About to land {push.commits.length} commits
          to <strong>{data.repository}</strong>.<br/>
          Please confirm these commit descriptions are correct
          before landing.<br/>
          If corrections are required, please amend the
          commit message and try again.</p>
      </div>
    );
    if (push.landing_blocker !== null) {
      switch (push.landing_blocker) {
        case 'Some commits are not ready to land.':
        case 'Already landed':
          message = <h2 className="warning">{push.landing_blocker}</h2>;
          break;
        case 'Landing is already in progress':
          message = <h2>{push.landing_blocker}</h2>;
          break;
        default:
          message = <h2 className="warning">Unrecognized response, please report!</h2>;
      }
    } else if (data.landings && data.landings[0]) {
      Object.keys(landing).forEach(landingId => {
        if (landing[landingId].status === 'failed') {
          failures[landingId] = landing[landingId];
        }
      });
      failureCount = Object.keys(failures).length;

      if (failureCount) {
        message = (
          <h2 className="warning">
            Landing failed: {failureCount} failure{failureCount > 1 ? 's' : ''}.
          </h2>
        );
      }
    }

    const landable = (failureCount === 0 && push.landing_blocker === null);

    return (
      <div>
        {message}
        <CommitsTable
          commits={push.commits}
          failures={failures}
          revisions={data.revisions} />
        <ActionButtons
          landable={landable}
          bug={data.bug}
          landcallback={this.sendPost} />
      </div>
    );
  }
}

export default AutolandController;
