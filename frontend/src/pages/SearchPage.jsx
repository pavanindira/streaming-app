import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSearch } from '../api/musicAPI';
import { FaPlay, FaSearch, FaPlus, FaUser, FaCompactDisc } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { usePlayer } from '../context/PlayerContext';

const SearchPage = () => {
    const { onSelect } = useOutletContext() || {};
    const { playSong } = usePlayer();
    const [searchTerm, setSearchTerm] = useState('');
    const [songToAdd, setSongToAdd] = useState(null);

    // Simple debounce logic
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: () => fetchSearch(debouncedSearch),
        enabled: !!debouncedSearch,
    });

    // Destructure results carefully as they might be undefined initially
    const { songs = [], albums = [], artists = [] } = results || {};

    return (
        <div className="space-y-8 pb-24">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-white">Search</h1>
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        className="w-full md:w-1/2 p-4 pl-12 rounded-full glass bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-12">
                {isLoading && <p className="text-gray-400">Searching...</p>}

                {!isLoading && debouncedSearch && !songs.length && !albums.length && !artists.length && (
                    <div className="col-span-full text-center py-20">
                        <p className="text-gray-500 text-xl">No results found for "{debouncedSearch}"</p>
                    </div>
                )}

                {/* SONGS SECTION */}
                {songs.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FaPlay className="text-sm" /> Songs</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {songs.map((track, i) => (
                                <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass p-4 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-2"
                                    onClick={() => playSong(track, songs)} // Direct play call
                                >
                                    {/* ... keeping existing Song Card UI ... */}
                                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg bg-gray-800">
                                        {track.cover_image_url ? (
                                            <img src={track.cover_image_url} alt={track.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); playSong(track, songs); }}
                                                className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:scale-110"
                                            >
                                                <FaPlay className="pl-1" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSongToAdd(track); }}
                                                className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 hover:scale-110"
                                                title="Add to Playlist"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-semibold truncate text-md">{track.title}</h3>
                                    <p className="text-gray-400 text-xs truncate mt-1">{track.artist?.name || "Unknown Artist"}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ALBUMS SECTION */}
                {albums.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FaCompactDisc /> Albums</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {albums.map((album) => (
                                <div key={album.id} className="glass p-4 rounded-2xl hover:bg-white/5 transition-colors">
                                    <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-800">
                                        {album.cover_image_url ?
                                            <img src={album.cover_image_url} className="w-full h-full object-cover" /> :
                                            <div className="w-full h-full flex items-center justify-center"><FaCompactDisc className="text-4xl text-gray-600" /></div>
                                        }
                                    </div>
                                    <h3 className="text-white font-medium truncate">{album.title}</h3>
                                    <p className="text-gray-400 text-xs truncate">{album.artist?.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ARTISTS SECTION */}
                {artists.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FaUser /> Artists</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {artists.map((artist) => (
                                <Link to={`/artists/${artist.id}`} key={artist.id}>
                                    <div className="glass p-4 rounded-2xl hover:bg-white/5 transition-colors flex flex-col items-center text-center cursor-pointer">
                                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-800">
                                            {artist.profile_picture_url ?
                                                <img src={artist.profile_picture_url} className="w-full h-full object-cover" /> :
                                                <div className="w-full h-full flex items-center justify-center"><FaUser className="text-4xl text-gray-600" /></div>
                                            }
                                        </div>
                                        <h3 className="text-white font-medium truncate w-full">{artist.name}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            <AnimatePresence>
                {songToAdd && (
                    <AddToPlaylistModal
                        song={songToAdd}
                        onClose={() => setSongToAdd(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchPage;
