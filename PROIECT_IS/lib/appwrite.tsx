import { Account, Client, ID, Databases, Models, Query,Permission,Role,Storage, ImageFormat, ImageGravity } from 'react-native-appwrite';


export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.timeless',
    projectId: '67347d0b0023d2d99e5a',
    databaseId: '67348067000e2b157e7a',
    userCollectionId: '673480820018743fc71e',
    postCollectionId: '673480d6001a93b860dd',
    storageId: '677fd66d000068a666c3', 
    orderCollectionid: '6782d2360012fb95b767',
};

//vezi documentatie appwrite pt login, foloseste useState 
// Initialize the Appwrite client
const client = new Client();
client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId) 
    .setPlatform(config.platform); 

export const account = new Account(client);
export const databases = new Databases(client);
const storage = new Storage(client);


export const loginUser = async (email: string, password: string) => {
    try{
        const session =  account.createEmailPasswordSession(email,password);
        return session; 
    }catch(error){
        console.log(error);
        throw Error;
    }
    
}


interface Post {
    $id: string;
  }
  export const fetchUserPosts = async (userId: string) => {
    try {
      // Step 1: Fetch user document from the "users" collection
      const userDoc = await databases.getDocument(
        config.databaseId,
        config.userCollectionId,
        userId
      );
  
      // Log the structure of the user document
      //console.log('User document:', userDoc);
  
      // Step 2: Extract the `posts` array from the user document
      const postIds = userDoc.posts || [];
  
      // Log the posts array to see its structure
      //console.log('User posts array:', postIds);
  
      // Ensure postIds is an array of valid post objects
      if (!Array.isArray(postIds)) {
        console.error('User posts data is not in expected array format.');
        return [];
      }
  
      // If no posts found, return empty array
      if (!postIds.length) {
        console.log('No posts found for the user.');
        return [];
      }
  
      // Step 3: Fetch the post details for each postId (adjust based on structure)
      const posts = await Promise.all(
        postIds.map(async (post: any) => {
          try {
            // Assuming post is an object, we now need to extract the ID
            const postId = post.$id || post.id;  // Adjust the property based on actual structure
  
            // Validate that postId is a string
            if (typeof postId !== 'string') {
              console.error(`Invalid postId: ${postId}`);
              return null; // Skip invalid postId
            }
  
            // Fetch the post document using postId
            const postDoc = await databases.getDocument(
              config.databaseId,
              config.postCollectionId, // Ensure this is the correct posts collection
              postId
            );
  
            // Log the post data for debugging
            console.log(`Fetched post data for postId: ${postId}`, {
              $id: postDoc.$id,
              $title: postDoc.title,
              $description: postDoc.description,
              $photoId: postDoc.photoId,
            });
            
            // Return the post data (adjust the keys as needed)
            return {
              $id: postDoc.$id,
              $title: postDoc.title,
              $description: postDoc.description,
              $photoId: postDoc.photoId,
            };
          } catch (error) {
            console.error(`Error fetching post with ID ${post.id || post.$id}:`, error);
            return null;
          }
        })
      );
  
      // Filter out any null results (in case of error fetching a post)
      return posts.filter((post) => post !== null);
  
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  };
  
  



// Function to create a user in Appwrite Database
export const createUserInDatabase = async (
    username: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    accountId: string
    ) => {
        try {
            const response = await databases.createDocument(
                config.databaseId,
                config.userCollectionId,
                ID.unique(),
                {
                    username: username,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password, 
                    accountId: accountId,
                    posts: [],
                    notifications: []
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any()),
                ]
            );
            console.log('User added to Database:', response);
            return response;
        } catch (error) {
            console.error('Error creating user in Database:', error);
            throw error;
        }
};

export const getCurrentUser = async () => {
    try{
        const currentAccount = await account.get();

        if(!currentAccount) throw new Error("Utilizator neautentificat.");

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser.documents.length) throw new Error("Utilizatorul curent nu există în baza de date.");

        return currentUser.documents[0];
    } catch(error){
        console.log("Eroare la obținerea utilizatorului curent:", error);
        throw error;
    }
}

export const logOutUser = async () => {
    try{
        await account.deleteSession('current');
        console.log('User logged out successfully');
    }catch(error){
        console.log("error logging out: " , error);
        throw(error);
    }
} 

export const getNotifications = async () => {
    try {
        // Step 1: Get the current user's account details
        const currentAccount = await account.get();
        if (!currentAccount) {
            throw new Error('User is not authenticated.');
        }

        // Step 2: Retrieve the user's document from the database
        const userDocResponse = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)] // Query by the current user's account ID
        );

        // Step 3: Check if the user document exists
        if (userDocResponse.documents.length === 0) {
            throw new Error('User document not found in the database.');
        }

        // Step 4: Extract the notifications array from the user document
        const userDoc = userDocResponse.documents[0];
        const notifications = userDoc.notifications || []; // Default to an empty array if no notifications

        console.log('Fetched notifications:', notifications);
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Function to create a user in Appwrite Auth and Database
export const createUser = async (
    email: string,
    password: string,
    username: string, // username field corresponds to "name" in Appwrite Auth
    firstname: string,
    lastname: string
) => {
    try {
        // Step 1: Create user in Appwrite Auth
        const authResponse = await account.create(ID.unique(), email, password, username);
        console.log('User created in Auth:', authResponse);

        
        // Step 2: Add the user to the database
        const dbResponse = await createUserInDatabase(username, firstname, lastname, email, password, authResponse.$id);

        const logInResponse = await loginUser(email, password);
        
        //const loginReponse = await loginUser(email, password);
        //setLoggedInUser(await account.get());

        return {
            authResponse,
            dbResponse,
            logInResponse
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Function to upload an image to Appwrite storage
export const uploadImageToStorage = async (uri: string) => {
    try {
        const file = {
            uri: uri, // The image URI
            name: 'image' + ID.unique, // You can dynamically set the image file name
            type: 'image/jpeg', // Set the image type (you can also use other types based on the image)
            size: 1
        };

        // Upload the image to Appwrite storage
        const fileResponse = await storage.createFile(
            config.storageId, // Your Appwrite bucket ID
            ID.unique(),
            file,
            
        );

        console.log('Image uploaded successfully:', fileResponse);
        console.log( fileResponse.$id); // Return the file ID
        return fileResponse.$id;
    } catch (error) {
        console.error('Error uploading image to storage:', error);
        throw error;
    }
};



export const updateUserPostedListings = async (
    userId : string,
    postId : string
) => {
    try{
        const userDoc = await databases.getDocument(
            config.databaseId,
            config.userCollectionId,
            userId
        )

        const response = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            userId,
            {
                posts: [...userDoc.posts, postId]
            }
        );
        console.log("PostId appended " + postId);
        return response;
    }catch(error){
        console.error('Error appending postId:', error);
        throw error;
    }
}

export const sendNotificationToUser = async(userId : string, sender : string, message : string) => {
    //userId is the userId of the user that receives the notification 
    try{
        const userDoc = await databases.getDocument(
            config.databaseId,
            config.userCollectionId,
            userId
        )
        
        const messageToSend = sender + ": " + message;
        const response = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            userId,     
            {
                notifications: [...userDoc.notifications, messageToSend]
            }
        );
        console.log("message sent  " + messageToSend);
        return response;
    }catch(error){
        console.error('Error appending notification:', error);
        throw error;
    }
}

export const createPostInDatabase = async (
    title: string,
    price: number,
    isNegotiable: boolean,
    description: string,
    brand: string,
    model: string,
    accountId: string,
    imageUris: string[]
) => {
    try {

        const imageFileIds = await Promise.all(
            imageUris.map((uri) => uploadImageToStorage(uri))
        );


        const response = await databases.createDocument(
            config.databaseId,
            config.postCollectionId,
            ID.unique(),
            {
                title: title,
                price: price,
                isNegotiable: isNegotiable,
                description: description,
                brand: brand,
                model: model,
                photoId: imageFileIds[0],
                userId : accountId 
            }
        );

        const postId = response.$id;
        await updateUserPostedListings(accountId, postId);

        console.log('Post created successfully:', response);
        return response;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

export const getImageUrlFromId = async (photoId: string) => {
    try {
      // Get file details from Appwrite storage using the file ID
  
      // Extract the file URL from the response
      const imageUrl =  storage.getFileDownload(config.storageId, photoId);
  
      console.log('File URL:', imageUrl);  // Log or use the URL as needed
  
      return imageUrl;  // Return the file URL
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  };

export const getPostsFromDatabase = async () => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.postCollectionId,
            [
                Query.orderDesc("$id"),
            ] 
        );
        //console.log('Posts fetched successfully:', response.documents);
        return response.documents; 
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

export const deletePostFromDatabase = async (postId: string) => {
    try {
        await databases.deleteDocument(config.databaseId, config.postCollectionId, postId);
        console.log('Post deleted successfully');
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

export const searchPosts = async (searchText: string) => {
    try {
        const queries = [
            Query.search('title', searchText),
            Query.search('description', searchText),
            Query.search('brand', searchText),
            Query.search('model', searchText),
        ];

        const results = await Promise.all(
            queries.map(query =>
                databases.listDocuments(
                    config.databaseId,
                    config.postCollectionId,
                    [query]
                )
            )
        );

        const combinedResults = Array.from(
            new Map(
                results
                    .flatMap(res => res.documents)
                    .map(doc => [doc.$id, doc])
            ).values()
        );

       // console.log('Search results:', combinedResults);
        return combinedResults;
    } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
    }
};
export const fetchAllPosts = async () => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.postCollectionId
        );
       // console.log('All posts fetched:', response.documents);
        return response.documents;
    } catch (error) {
        console.error('Error fetching all posts:', error);
        throw error;
    }
};
export const searchPostsLocally = async (searchText: string) => {
    try {
        const allPosts = await fetchAllPosts();

        const lowerSearchText = searchText.toLowerCase();

        const filteredPosts = allPosts
            .filter((post: any) =>
                post.title.toLowerCase().includes(lowerSearchText) ||
                post.description.toLowerCase().includes(lowerSearchText) ||
                post.brand.toLowerCase().includes(lowerSearchText) ||
                post.model.toLowerCase().includes(lowerSearchText)
            )
            .reverse(); 

        console.log('Filtered search results in reverse order:', filteredPosts);
        return filteredPosts;
    } catch (error) {
        console.error('Error during local search:', error);
        throw error;
    }
};

export const createOrder = async (
    adresa: string,
    zipCode: string,
    phoneNumber: string,
    idOrder: string,
    price: number
  ) => {
    try {
      // Creează documentul în colecția "Order"
      const response = await databases.createDocument(
        config.databaseId, 
        config.orderCollectionid, 
        ID.unique(), 
        {
          adresa: adresa,
          zipCode: zipCode,
          phoneNumber: phoneNumber,
          idOrder: idOrder,
          price: price,
        },
        [
          Permission.read(Role.any()), 
          Permission.update(Role.any()), 
          Permission.delete(Role.any()), 
        ]
      );
  
      console.log('Order created successfully:', response);
      return response; 
    } catch (error) {
      console.error('Error creating order:', error);
      throw error; 
    }
  };
  