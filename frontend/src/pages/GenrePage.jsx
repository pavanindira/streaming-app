import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../api/musicAPI';
import { FaPlay } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';

const GenrePage = () => {
    const { genre } = useParams();
    const { playSong } = usePlayer();

    const { data: songs, isLoading } = useQuery({
        queryKey: ['songs', 'genre', genre],
        queryFn: () => fetchSongs({ genre }),
    });

    if (isLoading) return <div className="p-8 text-center text-gray-400">Loading {genre} songs...</div>;

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                {genre}
            </h1>
            <p className="text-gray-400 mb-8">Top tracks in this genre</p>

            {!songs || songs.length === 0 ? (
                <div className="text-gray-500">No songs found for this genre.</div>
            ) : (
                <div className="grid gap-2">
                    {songs.map((song, i) => (
                        <div
                            key={song.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group transition-colors cursor-pointer"
                            onClick={() => playSong(song, songs)}
                        >
                            <span className="text-gray-500 w-6 text-center">{i + 1}</span>
                            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                <img
                                    src={song.cover_image_url || 'https://placehold.co/100'}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaPlay className="text-white text-xs" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{song.title}</h3>
                                <p className="text-gray-400 text-sm truncate">{song.artist?.name}</p>
                            </div>
                            <div className="text-gray-500 text-sm mr-4">
                                {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GenrePage;
