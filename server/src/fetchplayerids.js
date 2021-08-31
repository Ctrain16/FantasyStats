import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const seasons = [
  '20202021',
  '20192020',
  '20182019',
  '20172018',
  '20162017',
  '20152016',
  '20142015',
  '20132014',
  '20122013',
  '20112012',
  '20102011',
  '20092010',
  '20082009',
  '20072008',
  '20062007',
  '20052006',
];

const fetchPlayerIds = async function () {
  const playerIds = new Set();
  try {
    for (let i = 0; i < seasons.length; i++) {
      const { teams } = await (
        await fetch(
          `https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster&season=${seasons[i]}`
        )
      ).json();

      teams?.forEach((team) => {
        team?.roster?.roster?.forEach((player) => {
          playerIds.add(player.person.id);
        });
      });
    }

    const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();

    const playerIdCollection = mongoClient
      .db('playerdb')
      .collection('player-ids');

    await playerIdCollection.updateOne(
      { _id: 1 },
      { $set: { playerids: [...playerIds] } },
      { upsert: true }
    );

    console.log(`[SUCCESS]: Player ids updated.`);
  } catch (error) {
    console.error(`[ERROR]: ${error}`);
  }
};

export { fetchPlayerIds };
