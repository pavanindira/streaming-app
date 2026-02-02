# Music Streaming Application

## Developer Notes

---

### **1. Overview**
This document provides details about the modules, routes, controllers, models, and database migrations implemented in the Music Streaming Application.

---

### **2. Modules**
The following modules are implemented in the application:

1. **User Management**:
   - Handles user registration, login, and profile management.
   - Supports roles: `user`, `artist`, `admin`, `moderator`.

2. **Music Management**:
   - Allows artists to upload albums and songs.
   - Supports categorization of songs by genre.

3. **Playlist Management**:
   - Enables users to create, update, and share playlists.
   - Supports public and private playlists.

4. **Audiobook Management**:
   - Allows artists to upload audiobooks with metadata such as title, author, narrator, and duration.
   - Supports categorization of audiobooks by genre.

5. **Analytics**:
   - Tracks user interactions such as plays, likes, downloads, and comments.

6. **Follower System**:
   - Allows users to follow artists and other users.

---

### **3. Routes**
The following routes are implemented in the application:

#### **3.1. User Routes**
| **Method** | **Endpoint**         | **Description**                  |
|------------|----------------------|----------------------------------|
| `POST`     | `/api/users/register`| Registers a new user.           |
| `POST`     | `/api/users/login`   | Authenticates a user.           |
| `GET`      | `/api/users/:id`     | Fetches user details by ID.     |
| `PUT`      | `/api/users/:id`     | Updates user details.           |

#### **3.2. Artist Routes**
| **Method** | **Endpoint**         | **Description**                  |
|------------|----------------------|----------------------------------|
| `POST`     | `/api/artists`       | Registers a new artist.         |
| `POST`     | `/api/artists/login` | Authenticates an artist.        |
| `GET`      | `/api/artists`       | Fetches all artists.            |
| `GET`      | `/api/artists/:id`   | Fetches artist details by ID.   |
| `PUT`      | `/api/artists/:id`   | Updates artist details by ID.   |
| `DELETE`   | `/api/artists/:id`   | Deletes an artist by ID.        |

#### **3.3. Album Routes**
| **Method** | **Endpoint**         | **Description**                  |
|------------|----------------------|----------------------------------|
| `POST`     | `/api/albums`        | Creates a new album.            |
| `GET`      | `/api/albums`        | Fetches all albums.             |
| `GET`      | `/api/albums/:id`    | Fetches album details by ID.    |
| `PUT`      | `/api/albums/:id`    | Updates album details by ID.    |
| `DELETE`   | `/api/albums/:id`    | Deletes an album by ID.         |

#### **3.4. Song Routes**
| **Method** | **Endpoint**         | **Description**                  |
|------------|----------------------|----------------------------------|
| `POST`     | `/api/songs`         | Uploads a new song.             |
| `GET`      | `/api/songs`         | Fetches all songs.              |
| `GET`      | `/api/songs/:id`     | Fetches song details by ID.     |

#### **3.5. Playlist Routes**
| **Method** | **Endpoint**               | **Description**                          |
|------------|----------------------------|------------------------------------------|
| `POST`     | `/api/playlists`           | Creates a new playlist.                 |
| `GET`      | `/api/playlists`           | Fetches all playlists.                  |
| `GET`      | `/api/playlists/:id`       | Fetches playlist details by ID.         |
| `POST`     | `/api/playlists/:id/songs` | Adds a song to a playlist.              |
| `DELETE`   | `/api/playlists/:id/songs/:songId` | Removes a song from a playlist.  |

#### **3.6. Audiobook Routes**
| **Method** | **Endpoint**         | **Description**                  |
|------------|----------------------|----------------------------------|
| `POST`     | `/api/audiobooks`    | Creates a new audiobook.         |
| `GET`      | `/api/audiobooks`    | Fetches all audiobooks.          |
| `GET`      | `/api/audiobooks/:id`| Fetches audiobook details by ID. |
| `PUT`      | `/api/audiobooks/:id`| Updates audiobook details by ID. |
| `DELETE`   | `/api/audiobooks/:id`| Deletes an audiobook by ID.      |

#### **3.7. Category Routes**
| **Method** | **Endpoint**         | **Description**                  |
|------------|----------------------|----------------------------------|
| `POST`     | `/api/categories`    | Creates a new category.          |
| `GET`      | `/api/categories`    | Fetches all categories.          |
| `GET`      | `/api/categories/:id`| Fetches category details by ID.  |
| `PUT`      | `/api/categories/:id`| Updates category details by ID.  |
| `DELETE`   | `/api/categories/:id`| Deletes a category by ID.        |

---

### **4. Controllers**
The following controllers handle the business logic for the application:

1. **User Controller**:
   - Handles user registration, login, and profile updates.
   - Filepath: `controllers/user.controller.js`.

2. **Artist Controller**:
   - Handles artist registration, login, and management of artist details.
   - Filepath: `controllers/artist.controller.js`.

3. **Album Controller**:
   - Handles album creation, updates, and retrieval.
   - Filepath: `controllers/album.controller.js`.

4. **Song Controller**:
   - Handles song uploads and retrieval.
   - Filepath: `controllers/song.controller.js`.

5. **Playlist Controller**:
   - Handles playlist creation, updates, and retrieval.
   - Filepath: `controllers/playlist.controller.js`.

6. **Audiobook Controller**:
   - Handles audiobook creation, updates, and retrieval.
   - Filepath: `controllers/audiobook.controller.js`.

7. **Category Controller**:
   - Handles category creation, updates, and retrieval.
   - Filepath: `controllers/category.controller.js`.

8. **Analytics Controller**:
   - Tracks user interactions such as plays, likes, and downloads.
   - Filepath: `controllers/analytics.controller.js`.

---

### **5. Models**
The following models are implemented in the application:

#### **5.1. User Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `name`          | String      | Name of the user.                   |
| `email`         | String      | Email address of the user.          |
| `password`      | String      | Hashed password of the user.        |
| `role`          | Enum        | Role of the user (`user`, `artist`, `admin`). |
| `createdAt`     | DateTime    | Timestamp when the user was created.|
| `updatedAt`     | DateTime    | Timestamp when the user was updated.|

#### **5.2. Artist Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `name`          | String      | Name of the artist.                 |
| `email`         | String      | Email address of the artist.        |
| `password`      | String      | Hashed password of the artist.      |
| `createdAt`     | DateTime    | Timestamp when the artist was created.|
| `updatedAt`     | DateTime    | Timestamp when the artist was updated.|

#### **5.3. Album Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `title`         | String      | Title of the album.                 |
| `artist_id`     | Integer     | Foreign key referencing the artist. |
| `release_date`  | Date        | Release date of the album.          |
| `cover_image_url`| String     | URL of the album cover image.       |
| `createdAt`     | DateTime    | Timestamp when the album was created.|
| `updatedAt`     | DateTime    | Timestamp when the album was updated.|

#### **5.4. Song Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `title`         | String      | Title of the song.                  |
| `album_id`      | Integer     | Foreign key referencing the album.  |
| `duration`      | Integer     | Duration of the song in seconds.    |
| `file_url`      | String      | URL of the song file.               |
| `createdAt`     | DateTime    | Timestamp when the song was created.|
| `updatedAt`     | DateTime    | Timestamp when the song was updated.|

#### **5.5. Playlist Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `name`          | String      | Name of the playlist.               |
| `description`   | String      | Description of the playlist.        |
| `is_public`     | Boolean     | Indicates if the playlist is public.|
| `user_id`       | Integer     | Foreign key referencing the user.   |
| `createdAt`     | DateTime    | Timestamp when the playlist was created.|
| `updatedAt`     | DateTime    | Timestamp when the playlist was updated.|

#### **5.6. Audiobook Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `title`         | String      | Title of the audiobook.             |
| `author`        | String      | Author of the audiobook.            |
| `narrator`      | String      | Narrator of the audiobook.          |
| `duration`      | Integer     | Duration of the audiobook in seconds.|
| `file_url`      | String      | URL of the audiobook file.          |
| `cover_image_url`| String     | URL of the audiobook cover image.   |
| `release_date`  | Date        | Release date of the audiobook.      |
| `description`   | String      | Description of the audiobook.       |
| `category_id`   | Integer     | Foreign key referencing the category.|
| `createdAt`     | DateTime    | Timestamp when the audiobook was created.|
| `updatedAt`     | DateTime    | Timestamp when the audiobook was updated.|

#### **5.7. Category Model**
| **Field**       | **Type**     | **Description**                     |
|------------------|-------------|-------------------------------------|
| `id`            | Integer     | Primary key.                        |
| `name`          | String      | Name of the category.               |
| `description`   | String      | Description of the category.        |
| `createdAt`     | DateTime    | Timestamp when the category was created.|
| `updatedAt`     | DateTime    | Timestamp when the category was updated.|

---

### **6. Summary**
- This document provides an overview of the modules, routes, controllers, and models implemented in the application.
- Use the provided routes and controllers to extend or debug the application.
- Refer to the database migrations section for managing schema changes.
