const getVoters = (proposal: string) => `query {
    votes (
      first: 1000
      skip: 0
      where: {
        proposal: "${proposal}"
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      voter
      choice
    }
  }
  `

const getProposals = `
      query {
          proposals (
          first: 20,
          skip: 0,
          where: {
              space_in: ["expansiondao.eth"],
          },
          orderBy: "created",
          orderDirection: desc
          ) {
          id
          title
          body
          choices
          }
      }`;

export interface Proposal {
  id: string,
  title: string,
  body: string,
  choices: string[]
}

export interface Voter {
  voter: string;
  choice: number
}

export const fetchProposals = async (): Promise<Proposal[]> => {
  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: getProposals }),
  });
  const data = await response.json();
  return data.data.proposals;
}

export const fetchVoters = async (proposal: string): Promise<Voter[]> => {
  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: getVoters(proposal) }),
  });
  const data = await response.json();
  return data.data.votes;
}


